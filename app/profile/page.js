'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import './profile.css';

export default function Profile() {
  const { data: session, status } = useSession();
  const [userPosts, setUserPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingPostId, setDeletingPostId] = useState(null);
  const router = useRouter();

  // Comprobar si el usuario está autenticado
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Cargar los posts del usuario
  useEffect(() => {
    async function loadUserPosts() {
      if (session?.user?.id) {
        try {
          const response = await fetch(`/api/posts/user/${session.user.id}`);
          
          if (!response.ok) {
            throw new Error('Error al cargar los posts');
          }
          
          const data = await response.json();
          setUserPosts(data);
        } catch (error) {
          console.error('Error al cargar los posts del usuario:', error);
          setError('No se pudieron cargar tus posts. Intenta de nuevo más tarde.');
        } finally {
          setLoading(false);
        }
      }
    }
    
    if (session) {
      loadUserPosts();
    }
  }, [session]);

  const handleDeletePost = async (postId) => {
    if (!confirm('¿Estás seguro que deseas eliminar este post? Esta acción no se puede deshacer.')) {
      return;
    }
    
    setDeletingPostId(postId);
    
    try {
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Error al eliminar el post');
      }
      
      // Actualizar la lista de posts eliminando el que se borró
      setUserPosts(userPosts.filter(post => post._id !== postId));
    } catch (error) {
      console.error('Error al eliminar el post:', error);
      alert('No se pudo eliminar el post. Intenta de nuevo más tarde.');
    } finally {
      setDeletingPostId(null);
    }
  };

  // Mostrar spinner de carga mientras se verifica la sesión
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

  // Asegurarnos de que el usuario esté autenticado
  if (!session) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="profile-container">
          <div className="profile-header">
            <h1 className="profile-title">Mi Perfil</h1>
            <div className="profile-info">
              <div className="profile-avatar">
                {session.user.image ? (
                  <img src={session.user.image} alt={session.user.name} />
                ) : (
                  <div className="profile-avatar-placeholder">
                    {session.user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h2 className="profile-name">{session.user.name}</h2>
                <p className="profile-email">{session.user.email}</p>
              </div>
            </div>
          </div>
          
          <div className="profile-content">
            <div className="profile-section">
              <div className="profile-section-header">
                <h3 className="profile-section-title">Mis Posts</h3>
                <Link href="/new-post" className="btn">Crear Nuevo Post</Link>
              </div>
              
              {loading ? (
                <div className="loading-small">Cargando tus posts...</div>
              ) : error ? (
                <div className="profile-error">{error}</div>
              ) : userPosts.length === 0 ? (
                <div className="profile-empty-state">
                  <p>Aún no has publicado ningún post.</p>
                  <p>¡Comparte tus pensamientos con el mundo!</p>
                </div>
              ) : (
                <div className="profile-posts-list">
                  {userPosts.map((post) => (
                    <div key={post._id} className="profile-post-card">
                      <div className="profile-post-content">
                        <h4 className="profile-post-title">
                          <Link href={`/posts/${post._id}`}>{post.title}</Link>
                        </h4>
                        <p className="profile-post-excerpt">
                          {post.content.replace(/<[^>]*>/g, '').slice(0, 100)}
                          {post.content.length > 100 ? '...' : ''}
                        </p>
                        <div className="profile-post-meta">
                          <span className="profile-post-date">
                            {new Date(post.createdAt).toLocaleDateString('es-ES', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="profile-post-comments">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                            {post.commentCount || 0}
                          </span>
                        </div>
                      </div>
                      <div className="profile-post-actions">
                        <Link href={`/posts/${post._id}`} className="btn btn-secondary profile-post-btn">
                          Ver
                        </Link>
                        <Link href={`/posts/edit/${post._id}`} className="btn profile-post-btn">
                          Editar
                        </Link>
                        <button 
                          className="btn btn-danger profile-post-btn"
                          onClick={() => handleDeletePost(post._id)}
                          disabled={deletingPostId === post._id}
                        >
                          {deletingPostId === post._id ? 'Eliminando...' : 'Eliminar'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </>
  );
} 