import mongoose from 'mongoose';

// Esquemas de modelos
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Por favor añade un nombre'],
  },
  email: {
    type: String,
    required: [true, 'Por favor añade un email'],
    unique: true,
  },
  password: {
    type: String,
    required: [true, 'Por favor añade una contraseña'],
  },
  image: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor añade un título'],
  },
  description: {
    type: String,
    required: [true, 'Por favor añade una descripción'],
    maxlength: [250, 'La descripción no puede tener más de 250 caracteres'],
  },
  content: {
    type: String,
    required: [true, 'Por favor añade contenido'],
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentSchema = new mongoose.Schema({
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 1000
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Configuración global de la conexión
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Por favor define la variable de entorno MONGODB_URI');
}

/**
 * Variable global para mantener la conexión a la base de datos en desarrollo
 * https://github.com/vercel/next.js/blob/canary/examples/with-mongodb-mongoose/lib/dbConnect.js
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Función para conectar a la base de datos
async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: 'test',
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Registrar los modelos
const User = mongoose.models.User || mongoose.model('User', UserSchema);
const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

export { dbConnect, User, Post, Comment }; 