import { NextResponse } from 'next/server';
import { dbConnect, Post, Comment } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// GET - Obtener todos los posts
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
    
    // Obtener todos los posts con información de autor
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .lean();
    
    // Agregar conteo de comentarios para cada post
    const postsWithCommentCount = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      // Asegurarnos de que author siempre tenga un valor
      if (!post.author) {
        post.author = { name: 'Usuario desconocido' };
      }
      return { ...post, commentCount };
    }));
    
    return NextResponse.json(postsWithCommentCount);
  } catch (error) {
    console.error('Error al obtener posts:', error);
    return NextResponse.json(
      { message: 'Error al obtener posts' },
      { status: 500 }
    );
  }
} 