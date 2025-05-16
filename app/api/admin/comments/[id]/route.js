import { NextResponse } from 'next/server';
import { dbConnect, Comment } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// DELETE - Eliminar un comentario
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
    
    // Verificar si el comentario existe
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { message: 'Comentario no encontrado' },
        { status: 404 }
      );
    }
    
    // Eliminar el comentario
    await Comment.findByIdAndDelete(id);
    
    return NextResponse.json({ message: 'Comentario eliminado correctamente' });
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { message: 'Error al eliminar comentario' },
      { status: 500 }
    );
  }
} 