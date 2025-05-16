import { NextResponse } from 'next/server';
import { dbConnect, Comment } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// GET - Obtener todos los comentarios
export async function GET(request) {
  const session = await getServerSession(authOptions);
  
  // Verificar autenticación y rol de administrador
  if (!session || !session.user || session.user.role !== 'admin') {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    );
  }

  try {
    await dbConnect();
    
    // Obtener todos los comentarios con información de autor y post
    const comments = await Comment.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .populate('post', 'title')
      .lean();
    
    // Asegurarnos de que author y post siempre tengan un valor
    const processedComments = comments.map(comment => {
      if (!comment.author) {
        comment.author = { name: 'Usuario desconocido' };
      }
      if (!comment.post) {
        comment.post = { title: 'Post eliminado', _id: 'deleted' };
      }
      return comment;
    });
    
    return NextResponse.json(processedComments);
  } catch (error) {
    console.error('Error al obtener comentarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener comentarios' },
      { status: 500 }
    );
  }
} 