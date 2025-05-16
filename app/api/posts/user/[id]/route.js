import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { dbConnect, Post, Comment } from '@/app/lib/dbConnect';
import { authOptions } from '@/app/lib/auth';
import mongoose from 'mongoose';

export async function GET(request, { params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);

  // Verificar autenticación
  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    );
  }

  // Solo permitir al usuario ver sus propios posts
  if (session.user.id !== id) {
    return NextResponse.json(
      { message: 'No tienes permiso para ver estos posts' },
      { status: 403 }
    );
  }

  try {
    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Buscar los posts del usuario
    const posts = await Post.find({ author: id })
      .sort({ createdAt: -1 })
      .lean();
      
    // Obtener el conteo de comentarios para cada post
    const postsWithComments = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      return { ...post, commentCount };
    }));
    
    return NextResponse.json(postsWithComments);
  } catch (error) {
    console.error(`Error al obtener los posts del usuario con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al obtener los posts del usuario' },
      { status: 500 }
    );
  }
} 