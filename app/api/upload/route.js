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
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json({ error: 'Error al subir imagen' }, { status: 500 });
  }
} 