require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Configuración de conexión a MongoDB
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error('❌ Por favor define la variable de entorno MONGODB_URI');
  process.exit(1);
}

// Modelo de Usuario
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

// Obtener modelo
let User;
try {
  User = mongoose.model('User');
} catch (error) {
  User = mongoose.model('User', UserSchema);
}

// Conexión a MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Conexión a MongoDB establecida');
    return true;
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    return false;
  }
}

// Crear usuario administrador
async function createAdmin() {
  try {
    // Verificar si ya existe un administrador
    const existingAdmin = await User.findOne({ email: 'admin@gmail.com' });
    
    if (existingAdmin) {
      console.log('⚠️ El usuario administrador ya existe');
      return;
    }
    
    // Hashear la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('19Septiembre', salt);
    
    // Crear el usuario administrador
    const admin = new User({
      name: 'Administrador',
      email: 'admin@gmail.com',
      password: hashedPassword,
      role: 'admin'
    });
    
    await admin.save();
    console.log('✅ Usuario administrador creado exitosamente');
  } catch (error) {
    console.error('❌ Error al crear el usuario administrador:', error.message);
  }
}

// Ejecutar el script
async function main() {
  const connected = await connectDB();
  
  if (!connected) {
    console.error('❌ No se pudo conectar a la base de datos. Abortando...');
    process.exit(1);
  }
  
  await createAdmin();
  
  // Cerrar la conexión
  await mongoose.disconnect();
  console.log('✅ Conexión a MongoDB cerrada');
  process.exit(0);
}

main(); 