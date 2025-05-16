'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/app/components/Navbar';
import PostEditor from '@/app/components/PostEditor';
import './edit-post.css';

export default function EditPost({ params }) {
  const { id } = params;
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    content: '',
    imageUrl: '',
  });
  const [originalImageUrl, setOriginalImageUrl] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { data: session, status } = useSession();
  const router = useRouter();

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Cargar los datos del post
  useEffect(() => {
    async function loadPost() {
      try {
        const response = await fetch(`/api/posts/${id}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar el post');
        }
        
        const post = await response.json();
        
        // Verificar que el usuario sea el autor del post
        if (session?.user?.id !== post.author._id) {
          setError('No tienes permiso para editar este post');
          return;
        }
        
        setFormData({
          title: post.title,
          description: post.description || '',
          content: post.content,
          imageUrl: post.imageUrl || '',
        });
        
        if (post.imageUrl) {
          setImagePreview(post.imageUrl);
          setOriginalImageUrl(post.imageUrl);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error al cargar el post:', error);
        setError('No se pudo cargar el post. Intenta de nuevo más tarde.');
        setLoading(false);
      }
    }
    
    if (session?.user?.id) {
      loadPost();
    }
  }, [id, session, router]);

  // Mostrar spinner de carga mientras se verifica la sesión
  if (status === 'loading' || loading) {
    return (
      <>
        <Navbar />
        <main>
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  // Asegurarnos de que el usuario esté autenticado
  if (!session) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleContentChange = (html) => {
    setFormData(prev => ({
      ...prev,
      content: html
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

  const handleRemoveImage = () => {
    setImage(null);
    setImagePreview('');
    setFormData(prev => ({
      ...prev,
      imageUrl: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');

    try {
      let imageUrl = formData.imageUrl;
      
      // Si hay una nueva imagen, subirla
      if (image) {
        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: image,
        });
        
        if (!uploadResponse.ok) {
          throw new Error('Error al subir la imagen');
        }
        
        const uploadData = await uploadResponse.json();
        imageUrl = uploadData.url;
      }
      
      // Actualizar el post
      const response = await fetch(`/api/posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          content: formData.content,
          imageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al actualizar el post');
      }

      // Redirigir al post actualizado
      router.push(`/posts/${id}`);
    } catch (error) {
      console.error('Error al guardar post:', error);
      setError(error.message || 'Ocurrió un error al guardar el post');
      setIsSaving(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="edit-post-container">
          <div className="edit-post-header">
            <Link href={`/posts/${id}`} className="back-button">
              &larr; Cancelar y volver
            </Link>
            <h1 className="edit-post-title">Editar Post</h1>
          </div>
          
          {error && <div className="edit-post-error">{error}</div>}
          
          <form onSubmit={handleSubmit} className="edit-post-form">
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
              <PostEditor 
                content={formData.content} 
                onChange={handleContentChange} 
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Imagen destacada (opcional)</label>
              
              {imagePreview ? (
                <div className="image-preview-wrapper">
                  <img src={imagePreview} alt="Vista previa" className="image-preview" />
                  <button 
                    type="button" 
                    className="remove-image-btn"
                    onClick={handleRemoveImage}
                  >
                    Eliminar imagen
                  </button>
                </div>
              ) : (
                <div className="image-upload">
                  <input
                    type="file"
                    id="image"
                    name="image"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="form-input-file"
                  />
                  <label htmlFor="image" className="upload-label">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    <span>Seleccionar imagen</span>
                  </label>
                </div>
              )}
            </div>
            
            <div className="edit-post-actions">
              <Link href={`/posts/${id}`} className="btn btn-secondary">
                Cancelar
              </Link>
              <button type="submit" className="btn" disabled={isSaving}>
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </>
  );
} 