import { NextResponse } from 'next/server';
import { dbConnect, User } from '@/app/lib/dbConnect';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth';

// GET - Obtener todos los usuarios
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
    
    // Obtener todos los usuarios
    const users = await User.find({})
      .sort({ createdAt: -1 })
      .select('name email role createdAt')
      .lean();
    
    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener usuarios' },
      { status: 500 }
    );
  }
} 