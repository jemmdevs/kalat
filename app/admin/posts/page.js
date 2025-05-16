'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function PostsAdmin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadPosts() {
      try {
        const res = await fetch('/api/admin/posts');
        
        if (!res.ok) {
          throw new Error('Error al cargar posts');
        }
        
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        console.error('Error al cargar posts:', err);
        setError('No se pudieron cargar los posts');
      } finally {
        setLoading(false);
      }
    }
    
    loadPosts();
  }, []);

  const handleDelete = async (postId) => {
    if (!confirm('¿Estás seguro que deseas eliminar este post? Esta acción eliminará también todos sus comentarios y no se puede deshacer.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Error al eliminar post');
      }
      
      // Actualizar la lista de posts
      setPosts(posts.filter(post => post._id !== postId));
    } catch (err) {
      console.error('Error al eliminar post:', err);
      alert('No se pudo eliminar el post');
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
        Cargando posts...
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
        <h1 className="admin-title">Gestión de Posts</h1>
        <p className="admin-subtitle">
          Administra los posts publicados en la plataforma.
        </p>
      </header>
      
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Comentarios</th>
              <th>Fecha de Publicación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post._id}>
                <td>
                  <Link href={`/posts/${post._id}`} className="admin-link" target="_blank">
                    {post.title}
                  </Link>
                </td>
                <td>{post.author ? post.author.name : 'Usuario desconocido'}</td>
                <td>{post.commentCount}</td>
                <td>{formatDate(post.createdAt)}</td>
                <td>
                  <div className="admin-actions">
                    <Link 
                      href={`/posts/edit/${post._id}`} 
                      className="admin-action-btn edit"
                      title="Editar post"
                      target="_blank"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </Link>
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(post._id)}
                      title="Eliminar post"
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