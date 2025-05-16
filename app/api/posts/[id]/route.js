import { NextResponse } from 'next/server';
import connectDB from '@/app/lib/mongodb';
import Post from '@/app/models/Post';
import Comment from '@/app/models/Comment';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// Obtener post por ID (GET)
export async function GET(request, { params }) {
  const { id } = params;
  
  try {
    // Validar formato del ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: 'ID de post inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar el post por ID
    const post = await Post.findById(id)
      .populate('author', 'name')
      .lean();
    
    // Verificar si el post existe
    if (!post) {
      return NextResponse.json(
        { message: 'Post no encontrado' },
        { status: 404 }
      );
    }
    
    // Obtener el número de comentarios
    const commentCount = await Comment.countDocuments({ post: post._id });
    
    // Añadir el contador de comentarios al post
    post.commentCount = commentCount;
    
    return NextResponse.json(post);
  } catch (error) {
    console.error(`Error al obtener el post con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al obtener el post' },
      { status: 500 }
    );
  }
}

// Actualizar post (PUT)
export async function PUT(request, { params }) {
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
        { message: 'ID de post inválido' },
        { status: 400 }
      );
    }
    
    const { title, description, content, imageUrl } = await request.json();
    
    // Validar campos requeridos
    if (!title || !description || !content) {
      return NextResponse.json(
        { message: 'El título, descripción y contenido son obligatorios' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar el post
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario sea el autor del post
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para editar este post' },
        { status: 403 }
      );
    }
    
    // Actualizar el post
    post.title = title;
    post.description = description;
    post.content = content;
    post.imageUrl = imageUrl || '';
    
    await post.save();
    
    return NextResponse.json(
      { message: 'Post actualizado correctamente', post },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error al actualizar el post con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al actualizar el post' },
      { status: 500 }
    );
  }
}

// Eliminar post (DELETE)
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
        { message: 'ID de post inválido' },
        { status: 400 }
      );
    }
    
    await connectDB();
    
    // Buscar el post
    const post = await Post.findById(id);
    
    if (!post) {
      return NextResponse.json(
        { message: 'Post no encontrado' },
        { status: 404 }
      );
    }
    
    // Verificar que el usuario sea el autor del post
    if (post.author.toString() !== session.user.id) {
      return NextResponse.json(
        { message: 'No tienes permiso para eliminar este post' },
        { status: 403 }
      );
    }
    
    // Eliminar todos los comentarios del post
    await Comment.deleteMany({ post: id });
    
    // Eliminar el post
    await Post.findByIdAndDelete(id);
    
    return NextResponse.json(
      { message: 'Post eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error(`Error al eliminar el post con ID ${id}:`, error);
    return NextResponse.json(
      { message: 'Error al eliminar el post' },
      { status: 500 }
    );
  }
} 