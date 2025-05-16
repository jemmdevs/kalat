'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';
import Navbar from '../components/Navbar';
import './new-post.css';

export default function NewPost() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Comprobar si el usuario está autenticado
  if (status === 'loading') {
    return (
      <>
        <Navbar />
        <main>
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  // Redirigir si no está autenticado
  if (!session) {
    router.replace('/login');
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let imageUrl = '';
      
      // Subir imagen si existe
      if (image) {
        const blob = await upload(image.name, image, {
          access: 'public',
          handleUploadUrl: '/api/upload',
        });
        imageUrl = blob.url;
      }
      
      // Crear post
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          imageUrl
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al crear el post');
      }

      // Redirigir a la página principal tras crear el post
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error al crear post', error);
      setError(error.message || 'Ocurrió un error al crear el post');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="post-form-container">
          <h1 className="post-form-title">Crear Nuevo Post</h1>
          
          {error && <div className="post-form-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="post-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">Título</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="form-input"
                required
                maxLength={100}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description" className="form-label">Descripción</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="form-input"
                required
                maxLength={250}
                rows={3}
                placeholder="Escribe una breve descripción del post (máximo 250 caracteres)"
              ></textarea>
              <small className="form-help-text">{formData.description.length}/250 caracteres</small>
            </div>
            
            <div className="form-group">
              <label htmlFor="content" className="form-label">Contenido</label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className="form-input post-content-textarea"
                required
                rows={8}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label htmlFor="image" className="form-label">Imagen (opcional)</label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleImageChange}
                accept="image/*"
                className="form-input-file"
              />
              
              {imagePreview && (
                <div className="image-preview-container">
                  <img src={imagePreview} alt="Vista previa" className="image-preview" />
                </div>
              )}
            </div>
            
            <div className="post-form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => router.back()}>
                Cancelar
              </button>
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Publicando...' : 'Publicar Post'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 