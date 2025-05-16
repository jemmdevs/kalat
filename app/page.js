import Link from 'next/link';
import Image from 'next/image';
import Navbar from './components/Navbar';
import { dbConnect, Post, Comment } from './lib/dbConnect';
import './home.css';

async function getPosts() {
  await dbConnect();
  try {
    const posts = await Post.find({})
      .sort({ createdAt: -1 })
      .populate('author', 'name')
      .limit(20)
      .lean();

    // Obtenemos el número de comentarios para cada post
    const postsWithCommentCount = await Promise.all(posts.map(async (post) => {
      const commentCount = await Comment.countDocuments({ post: post._id });
      // Asegurarnos de que author siempre tenga un valor
      if (!post.author) {
        post.author = { name: 'Usuario desconocido' };
      }
      return { ...post, commentCount };
    }));
    
    return JSON.parse(JSON.stringify(postsWithCommentCount));
  } catch (error) {
    console.error('Error al obtener posts:', error);
    return [];
  }
}

export default async function Home() {
  const posts = await getPosts();

  return (
    <>
      <Navbar />
      <main>
        <h1 className="page-title">Crystal Kalat!</h1>
        
        {posts.length === 0 ? (
          <div className="empty-state">
            <h2>¡No hay posts todavía!</h2>
            <p>Sé el primero en publicar algo.</p>
            <Link href="/new-post" className="btn">Crear un Post</Link>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <Link href={`/posts/${post._id}`} key={post._id} className="post-card-link">
                <div className="post-card">
                  {post.imageUrl && (
                    <div className="post-image-container">
                      <Image 
                        src={post.imageUrl} 
                        alt={post.title} 
                        className="post-image"
                        width={400}
                        height={250}
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <div className="post-content">
                    <h2 className="post-title">{post.title}</h2>
                    <p className="post-excerpt">
                      {post.description || (post.content.length > 150 
                        ? `${post.content.substring(0, 150)}...` 
                        : post.content)}
                    </p>
                    <div className="post-footer">
                      <span className="post-author">Por {post.author?.name || 'Usuario desconocido'}</span>
                      <div className="post-info">
                        <span className="post-date">
                          {new Date(post.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </span>
                        <span className="post-comments-count">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                          </svg>
                          {post.commentCount}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
