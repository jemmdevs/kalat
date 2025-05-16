import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import connectDB from '@/app/lib/mongodb';
import Post from '@/app/models/Post';
import { authOptions } from '@/app/lib/auth';

// Obtener todos los posts (GET)
export async function GET() {
  try {
    await connectDB();
    
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
    const { title, content, imageUrl } = await request.json();
    
    // Validar campos requeridos
    if (!title || !content) {
      return NextResponse.json(
        { message: 'El título y contenido son obligatorios' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Crear nuevo post
    const newPost = await Post.create({
      title,
      content,
      imageUrl: imageUrl || '',
      author: session.user.id,
    });
    
    // Poblar el autor para la respuesta
    await newPost.populate('author', 'name');
    
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