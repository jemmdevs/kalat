import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Comment from '@/app/models/Comment';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// Eliminar comentario (DELETE)
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

  try {
    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID de comentario inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
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
    console.error(`Error al eliminar el comentario con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al eliminar el comentario' },
      { status: 500 }
    );
  }
} 