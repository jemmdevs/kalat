import { NextResponse } from 'next/server';
import { dbConnect, User, Post, Comment } from '@/app/lib/dbConnect';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// DELETE - Eliminar un usuario y todo su contenido
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
    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID de usuario inválido' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Verificar que el usuario existe
    const user = await User.findById(id);
    
    if (!user) {
      return NextResponse.json(
        { message: 'Usuario no encontrado' },
        { status: 404 }
      );
    }
    
    // No permitir eliminar administradores
    if (user.role === 'admin') {
      return NextResponse.json(
        { message: 'No se puede eliminar un usuario administrador' },
        { status: 403 }
      );
    }
    
    // Iniciar una sesión de transacción
    const mongoSession = await mongoose.startSession();
    mongoSession.startTransaction();
    
    try {
      // Eliminar todos los comentarios del usuario
      await Comment.deleteMany({ author: id }, { session: mongoSession });
      
      // Obtener los posts del usuario
      const userPosts = await Post.find({ author: id }, { _id: 1 });
      const postIds = userPosts.map(post => post._id);
      
      // Eliminar todos los comentarios en los posts del usuario
      await Comment.deleteMany({ post: { $in: postIds } }, { session: mongoSession });
      
      // Eliminar todos los posts del usuario
      await Post.deleteMany({ author: id }, { session: mongoSession });
      
      // Eliminar el usuario
      await User.findByIdAndDelete(id, { session: mongoSession });
      
      // Confirmar la transacción
      await mongoSession.commitTransaction();
    } catch (error) {
      // Deshacer la transacción en caso de error
      await mongoSession.abortTransaction();
      throw error;
    } finally {
      // Finalizar la sesión
      mongoSession.endSession();
    }
    
    return NextResponse.json(
      { message: 'Usuario eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error al eliminar el usuario con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al eliminar el usuario' },
      { status: 500 }
    );
  }
} 