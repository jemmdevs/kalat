'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/app/components/Navbar';
import CommentSection from '@/app/components/CommentSection';
import './post.css';

export default function PostPage({ params }) {
  const { id } = params;
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    async function loadPost() {
      try {
        const res = await fetch(`/api/posts/${id}`);
        
        if (!res.ok) {
          throw new Error('No se pudo cargar el post');
        }
        
        const data = await res.json();
        
        // Asegurarse de que author siempre existe
        if (!data.author) {
          data.author = { name: 'Usuario desconocido' };
        }
        
        setPost(data);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar el post:', err);
        setError('No se pudo cargar el post. Por favor, intente de nuevo más tarde.');
        setLoading(false);
      }
    }
    
    loadPost();
  }, [id]);

  const isAuthor = session?.user?.id === post?.author?._id;
  
  const handleDelete = async () => {
    if (!confirm('¿Estás seguro que deseas eliminar este post? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('No se pudo eliminar el post');
      }
      
      router.push('/');
    } catch (err) {
      console.error('Error al eliminar el post:', err);
      setError('No se pudo eliminar el post. Por favor, intente de nuevo más tarde.');
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="post-container">
          <div className="loading">Cargando...</div>
        </main>
      </>
    );
  }

  if (error || !post) {
    return (
      <>
        <Navbar />
        <main className="post-container">
          <div className="error-message">{error || 'Post no encontrado'}</div>
          <Link href="/" className="back-button">
            &larr; Volver al Inicio
          </Link>
        </main>
      </>
    );
  }

  // Formatear la fecha
  const formattedDate = new Date(post.createdAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <>
      <Navbar />
      <main className="post-container">
        <div className="post-header">
          <Link href="/" className="back-button">
            &larr; Volver al Inicio
          </Link>
          
          {isAuthor && (
            <div className="post-actions">
              <Link href={`/posts/edit/${id}`} className="btn btn-secondary post-action-btn">
                Editar
              </Link>
              <button 
                className="btn btn-danger post-action-btn" 
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          )}
          
          <h1 className="post-title">{post.title}</h1>
          <div className="post-meta">
            <span className="post-author">Por {post.author?.name || 'Usuario desconocido'}</span>
            <span className="post-date">{formattedDate}</span>
          </div>
        </div>
        
        {post.imageUrl && (
          <div className="post-image-wrapper">
            <Image 
              src={post.imageUrl} 
              alt={post.title} 
              className="post-image" 
              width={800}
              height={500}
              style={{ objectFit: 'cover', width: '100%', height: 'auto' }}
              onError={(e) => {
                console.error('Error loading image:', post.imageUrl);
                console.log('Image error details:', e);
              }}
              unoptimized={true}
            />
            <p className="image-debug">Image URL: {post.imageUrl}</p>
          </div>
        )}
        
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
        
        {/* Sección de comentarios */}
        <CommentSection postId={id} />
      </main>
    </>
  );
} 