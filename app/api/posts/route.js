import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { dbConnect, Post } from '@/app/lib/dbConnect';
import { authOptions } from '@/app/lib/auth';
import { revalidatePath } from 'next/cache';

// Obtener todos los posts (GET)
export async function GET() {
  try {
    await dbConnect();
    
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .limit(20)
      .lean();
    
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    return NextResponse.json(
      { message: 'Error al obtener los posts' },
      { status: 500 }
    );
  }
}

// Crear un nuevo post (POST)
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Verificar autenticación
  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    );
  }
  
  try {
    const { title, description, content, imageUrl } = await request.json();
    
    // Validar campos requeridos
    if (!title || !description || !content) {
      return NextResponse.json(
        { message: 'El título, descripción y contenido son obligatorios' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Crear nuevo post
    const newPost = await Post.create({
      title,
      description,
      content,
      imageUrl: imageUrl || '',
      author: session.user.id,
    });
    
    // Poblar el autor para la respuesta
    await newPost.populate('author', 'name');
    
    // Revalidar la página principal para que muestre el nuevo post
    revalidatePath('/');
    
    return NextResponse.json(
      { message: 'Post creado correctamente', post: newPost },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear post:', error);
    return NextResponse.json(
      { message: 'Error al crear el post' },
      { status: 500 }
    );
  }
} 