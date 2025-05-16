'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import './CommentSection.css';

export default function CommentSection({ postId }) {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { data: session } = useSession();

  // Cargar comentarios del post
  useEffect(() => {
    async function loadComments() {
      try {
        const res = await fetch(`/api/comments?postId=${postId}`);
        
        if (!res.ok) {
          throw new Error('No se pudieron cargar los comentarios');
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
  }, [postId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    // Validar que el comentario no esté vacío
    if (!newComment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId,
          content: newComment.trim(),
        }),
      });
      
      if (!res.ok) {
        throw new Error('No se pudo publicar el comentario');
      }
      
      const data = await res.json();
      
      // Añadir el nuevo comentario a la lista
      setComments([data.comment, ...comments]);
      
      // Limpiar el formulario
      setNewComment('');
    } catch (err) {
      console.error('Error al publicar comentario:', err);
      setError('No se pudo publicar el comentario. Intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('¿Estás seguro que deseas eliminar este comentario?')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('No se pudo eliminar el comentario');
      }
      
      // Eliminar el comentario de la lista
      setComments(comments.filter(comment => comment._id !== commentId));
    } catch (err) {
      console.error('Error al eliminar comentario:', err);
      alert('No se pudo eliminar el comentario. Intenta de nuevo.');
    }
  };

  // Formatear la fecha para los comentarios
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) {
      return 'hace un momento';
    } else if (diffMins < 60) {
      return `hace ${diffMins} ${diffMins === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffHours < 24) {
      return `hace ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
    } else if (diffDays < 7) {
      return `hace ${diffDays} ${diffDays === 1 ? 'día' : 'días'}`;
    } else {
      return date.toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    }
  };

  return (
    <div className="comments-section">
      <h3 className="comments-title">Comentarios ({comments.length})</h3>
      
      {error && <div className="comments-error">{error}</div>}
      
      {session ? (
        <form onSubmit={handleCommentSubmit} className="comment-form">
          <div className="comment-form-avatar">
            {session.user.image ? (
              <img src={session.user.image} alt={session.user.name} />
            ) : (
              <div className="comment-avatar-placeholder">
                {session.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="comment-form-content">
            <textarea
              placeholder="Escribe un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
              maxLength={1000}
              disabled={isSubmitting}
              required
            />
            <button 
              type="submit" 
              className="btn comment-submit-btn"
              disabled={isSubmitting || !newComment.trim()}
            >
              {isSubmitting ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      ) : (
        <div className="comments-login-prompt">
          <p>Inicia sesión para dejar un comentario</p>
        </div>
      )}
      
      {loading ? (
        <div className="comments-loading">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">
          <p>No hay comentarios todavía. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment._id} className="comment-item">
              <div className="comment-avatar">
                {comment.author.image ? (
                  <img src={comment.author.image} alt={comment.author.name} />
                ) : (
                  <div className="comment-avatar-placeholder">
                    {comment.author.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="comment-content">
                <div className="comment-header">
                  <span className="comment-author">{comment.author.name}</span>
                  <span className="comment-date">{formatDate(comment.createdAt)}</span>
                </div>
                <div className="comment-text">{comment.content}</div>
                
                {session?.user?.id === comment.author._id && (
                  <button 
                    className="comment-delete-btn"
                    onClick={() => handleDeleteComment(comment._id)}
                  >
                    Eliminar
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 