import { handleUpload, put } from '@vercel/blob';
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
    // Obtener el formData directamente de la petición
    const formData = await request.formData();
    const file = formData.get("file");
    
    if (!file) {
      return NextResponse.json(
        { error: "No se encontró ningún archivo" },
        { status: 400 }
      );
    }

    // Subir archivo usando el método put
    const blob = await put(file.name, file, {
      access: 'public',
    });

    return NextResponse.json(blob);
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return NextResponse.json({ error: 'Error al subir imagen: ' + error.message }, { status: 500 });
  }
} 