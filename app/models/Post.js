import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Por favor añade un título'],
    maxlength: [100, 'El título no puede tener más de 100 caracteres'],
  },
  content: {
    type: String,
    required: [true, 'Por favor añade el contenido'],
  },
  imageUrl: {
    type: String,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Post || mongoose.model('Post', PostSchema); 