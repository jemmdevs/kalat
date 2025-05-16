import { NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import connectDB from '@/app/lib/mongodb';
import User from '@/app/models/User';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();
    
    // Validar campos
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: 'Todos los campos son obligatorios' },
        { status: 400 }
      );
    }
    
    // Conectar a la base de datos
    await connectDB();
    
    // Verificar si el email ya existe
    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json(
        { message: 'El email ya está registrado' },
        { status: 409 }
      );
    }
    
    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Crear nuevo usuario
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword
    });
    
    // Devolver usuario creado (sin contraseña)
    const user = {
      id: newUser._id.toString(),
      name: newUser.name,
      email: newUser.email,
    };
    
    return NextResponse.json(
      { message: 'Usuario registrado correctamente', user },
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