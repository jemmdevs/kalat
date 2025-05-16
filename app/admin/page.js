import { dbConnect, User, Post, Comment } from '../lib/dbConnect';

async function getStats() {
  await dbConnect();
  
  try {
    // Obtener conteo total de usuarios, posts y comentarios
    const userCount = await User.countDocuments();
    const postCount = await Post.countDocuments();
    const commentCount = await Comment.countDocuments();
    
    // Obtener usuarios más recientes
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt')
      .lean();
    
    // Obtener posts más recientes
    const recentPosts = await Post.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .lean();
    
    // Procesar los posts para manejar autores null
    const processedPosts = recentPosts.map(post => {
      if (!post.author) {
        post.author = { name: 'Usuario desconocido' };
      }
      return post;
    });
    
    // Obtener comentarios más recientes
    const recentComments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('author', 'name')
      .populate('post', 'title')
      .lean();
    
    // Procesar los comentarios para manejar autores o posts null
    const processedComments = recentComments.map(comment => {
      if (!comment.author) {
        comment.author = { name: 'Usuario desconocido' };
      }
      if (!comment.post) {
        comment.post = { title: 'Post eliminado' };
      }
      return comment;
    });
    
    return {
      userCount,
      postCount,
      commentCount,
      recentUsers,
      recentPosts: processedPosts,
      recentComments: processedComments
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    // Retornar datos vacíos en caso de error
    return {
      userCount: 0,
      postCount: 0,
      commentCount: 0,
      recentUsers: [],
      recentPosts: [],
      recentComments: []
    };
  }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  
  // Formatear fechas
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };
  
  return (
    <div>
      <header className="admin-header">
        <h1 className="admin-title">Panel de Administración</h1>
        <p className="admin-subtitle">
          Bienvenido al panel de administración de Kalat. Aquí puedes gestionar todos los aspectos de la plataforma.
        </p>
      </header>
      
      <div className="admin-stats">
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.userCount}</div>
          <div className="admin-stat-label">Usuarios Registrados</div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.postCount}</div>
          <div className="admin-stat-label">Posts Publicados</div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-value">{stats.commentCount}</div>
          <div className="admin-stat-label">Comentarios</div>
        </div>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Usuarios Recientes</h2>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Fecha de Registro</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentUsers.map(user => (
              <tr key={user._id || 'unknown'}>
                <td>{user.name || 'Nombre no disponible'}</td>
                <td>{user.email || 'Email no disponible'}</td>
                <td>{user.createdAt ? formatDate(user.createdAt) : 'Fecha desconocida'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Posts Recientes</h2>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Autor</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentPosts.map(post => (
              <tr key={post._id || 'unknown'}>
                <td>{post.title || 'Sin título'}</td>
                <td>{post.author?.name || 'Usuario desconocido'}</td>
                <td>{post.createdAt ? formatDate(post.createdAt) : 'Fecha desconocida'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="admin-card">
        <div className="admin-card-header">
          <h2 className="admin-card-title">Comentarios Recientes</h2>
        </div>
        
        <table className="admin-table">
          <thead>
            <tr>
              <th>Post</th>
              <th>Autor</th>
              <th>Contenido</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {stats.recentComments.map(comment => (
              <tr key={comment._id || 'unknown'}>
                <td>{comment.post?.title || 'Post eliminado'}</td>
                <td>{comment.author?.name || 'Usuario desconocido'}</td>
                <td>{comment.content ? (comment.content.length > 50 ? `${comment.content.substring(0, 50)}...` : comment.content) : 'Sin contenido'}</td>
                <td>{comment.createdAt ? formatDate(comment.createdAt) : 'Fecha desconocida'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 