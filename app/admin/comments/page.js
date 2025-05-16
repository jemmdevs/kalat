'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CommentsAdmin() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch('/api/admin/comments');
        
        if (!res.ok) {
          throw new Error('Error al cargar comentarios');
        }
        
        const data = await res.json();
        setComments(data);
      } catch (err) {
        console.error('Error al cargar comentarios:', err);
        setError('No se pudieron cargar los comentarios');
      } finally {
        setLoading(false);
      }
    }
    
    loadComments();
  }, []);

  const handleDelete = async (commentId) => {
    if (!confirm('¿Estás seguro que deseas eliminar este comentario? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Error al eliminar comentario');
      }
      
      // Actualizar la lista de comentarios
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      alert('No se pudo eliminar el comentario');
    }
  };

  // Formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="admin-loading">
        Cargando comentarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-error">
        {error}
      </div>
    );
  }

  return (
    <div>
      <header className="admin-header">
        <h1 className="admin-title">Gestión de Comentarios</h1>
        <p className="admin-subtitle">
          Administra los comentarios publicados en la plataforma.
        </p>
      </header>
      
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Autor</th>
              <th>Contenido</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {comments.map(comment => (
              <tr key={comment._id}>
                <td>
                  <Link href={`/posts/${comment.post._id}`} className="admin-link" target="_blank">
                    {comment.post.title}
                  </Link>
                </td>
                <td>{comment.author ? comment.author.name : 'Usuario desconocido'}</td>
                <td>
                  <div className="comment-content-preview">
                    {comment.content.length > 100 ? `${comment.content.substring(0, 100)}...` : comment.content}
                  </div>
                </td>
                <td>{formatDate(comment.createdAt)}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(comment._id)}
                      title="Eliminar comentario"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 