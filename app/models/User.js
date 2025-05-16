import mongoose from 'mongoose';

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
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema); 