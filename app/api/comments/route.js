import { NextResponse } from 'next/server';
import { dbConnect, Comment, Post } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// GET - Obtener comentarios de un post
export async function GET(request) {
  const url = new URL(request.url);
  const postId = url.searchParams.get('postId');
  
  if (!postId) {
    return NextResponse.json(
      { message: 'Se requiere el ID del post' }, 
      { status: 400 }
    );
  }
  
  try {
    await dbConnect();
    
    // Obtener comentarios del post
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: -1 })
      .populate('author', 'name image')
      .lean();
    
    return NextResponse.json(comments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
}

// POST - Crear un nuevo comentario
export async function POST(request) {
  const session = await getServerSession(authOptions);
  
  // Verificar que el usuario esté autenticado
  if (!session) {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    );
  }
  
  const { postId, content } = await request.json();
  
  // Validar datos
  if (!postId || !content) {
    return NextResponse.json(
      { message: 'ID del post y contenido son requeridos' },
      { status: 400 }
    );
  }
  
  try {
    await dbConnect();
    
    // Verificar que el post existe
    const post = await Post.findById(postId);
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post no encontrado' },
        { status: 404 }
      );
    }
    
    // Crear el comentario
    const comment = await Comment.create({
      post: postId,
      author: session.user.id,
      content,
    });
    
    // Poblar el autor del comentario
    await comment.populate('author', 'name image');
    
    return NextResponse.json(
      { message: 'Comentario creado correctamente', comment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { message: 'Error al crear comentario' },
      { status: 500 }
    );
  }
} 