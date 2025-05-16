import { handleUpload } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { getServerSession } from "next-auth/next";
import { authOptions } from '@/app/lib/auth';

export async function POST(request) {
  const session = await getServerSession(authOptions);

  // Verificar autenticación
  if (!session || !session.user) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
  }

  try {
    const response = await handleUpload({
      request,
      token: {
        // Esta es una forma simple de generar un token para el ejemplo
        // En producción deberías usar un método más seguro
        data: JSON.stringify({ userId: session.user.id }),
        expires: Date.now() + 1000 * 60 * 10, // 10 minutos
      },
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
} 