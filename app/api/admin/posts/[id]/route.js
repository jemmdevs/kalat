import { NextResponse } from 'next/server';
import { dbConnect, Post, Comment } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import { del } from '@vercel/blob';

// DELETE - Eliminar un post y sus comentarios
export async function DELETE(request, { params }) {
  const { id } = params;
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
    
    // Obtener el post primero para verificar si tiene imagen
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post no encontrado' },
        { status: 404 }
      );
    }
    
    // Si el post tiene una imagen, eliminarla del storage
    if (post.imageUrl) {
      try {
        await del(post.imageUrl);
      } catch (blobError) {
        console.error('Error al eliminar la imagen:', blobError);
        // Continuamos con la eliminación del post aunque falle la eliminación de la imagen
      }
    }
    
    // Eliminar todos los comentarios del post
    await Comment.deleteMany({ post: id });
    
    // Eliminar el post
    await Post.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Post eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar post:', error);
    return NextResponse.json(
      { message: 'Error al eliminar post' },
      { status: 500 }
    );
  }
} 