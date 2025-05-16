import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { dbConnect, User } from '@/app/lib/dbConnect';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validar datos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    await dbConnect();
    
    // Verificar si el usuario ya existe
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 400 }
      );
    }
    
    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear usuario
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
    
    return NextResponse.json(
      { 
        message: 'Usuario registrado correctamente',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        }
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return NextResponse.json(
      { message: 'Error al registrar usuario' },
      { status: 500 }
    );
  }
} 