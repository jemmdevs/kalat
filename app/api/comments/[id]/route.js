import { NextResponse } from 'next/server';
import { dbConnect, Comment } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';
import mongoose from 'mongoose';

// DELETE - Eliminar un comentario
export async function DELETE(request, { params }) {
  const { id } = params;
  const session = await getServerSession(authOptions);
  
  // Verificar autenticación
  if (!session || !session.user) {
    return NextResponse.json(
      { message: 'No autorizado' },
      { status: 401 }
    );
  }
  
  // Validar el formato del ID
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { message: 'ID de comentario inválido' },
      { status: 400 }
    );
  }
  
  try {
    await dbConnect();
    
    // Buscar el comentario
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return NextResponse.json(
        { message: 'Comentario no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario sea el autor del comentario
    if (comment.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para eliminar este comentario' },
        { status: 403 }
      );
    }
    
    // Eliminar el comentario
    await Comment.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Comentario eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar comentario:', error);
    return NextResponse.json(
      { message: 'Error al eliminar comentario' },
      { status: 500 }
    );
  }
}