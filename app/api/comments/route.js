import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Comment from '@/app/models/Comment';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// GET - Obtener comentarios por post ID
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const postId = searchParams.get('postId');
  
  if (!postId) {
    return NextResponse.json(
      { message: 'Se requiere el ID del post' },
      { status: 400 }
    );
  }

  try {
    await connectDB();
    
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

// POST - Crear nuevo comentario
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
    const { postId, content } = await request.json();
    
    // Validar campos requeridos
    if (!postId || !content) {
      return NextResponse.json(
        { message: 'Se requiere el ID del post y el contenido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Crear el comentario
    const newComment = await Comment.create({
      post: postId,
      author: session.user.id,
      content,
    });
    
    // Poblar los datos del autor para devolverlo en la respuesta
    const populatedComment = await Comment.findById(newComment._id)
      .populate('author', 'name image')
      .lean();
    
    return NextResponse.json(
      { message: 'Comentario creado correctamente', comment: populatedComment },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al crear comentario:', error);
    return NextResponse.json(
      { message: 'Error al crear el comentario' },
      { status: 500 }
    );
  }
} 