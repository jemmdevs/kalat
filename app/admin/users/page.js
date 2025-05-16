'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function UsersAdmin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    async function loadUsers() {
      try {
        const res = await fetch('/api/admin/users');
        
        if (!res.ok) {
          throw new Error('Error al cargar usuarios');
        }
        
        const data = await res.json();
        setUsers(data);
      } catch (err) {
        console.error('Error al cargar usuarios:', err);
        setError('No se pudieron cargar los usuarios');
      } finally {
        setLoading(false);
      }
    }
    
    loadUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!confirm('¿Estás seguro que deseas eliminar este usuario? Esta acción eliminará también todos sus posts y comentarios y no se puede deshacer.')) {
      return;
    }
    
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      });
      
      if (!res.ok) {
        throw new Error('Error al eliminar usuario');
      }
      
      // Actualizar la lista de usuarios
      setUsers(users.filter(user => user._id !== userId));
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      alert('No se pudo eliminar el usuario');
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
        Cargando usuarios...
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
        <h1 className="admin-title">Gestión de Usuarios</h1>
        <p className="admin-subtitle">
          Administra los usuarios registrados en la plataforma.
        </p>
      </header>
      
      <div className="admin-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha de Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>
                  <span className={`user-role ${user.role}`}>
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </span>
                </td>
                <td>{formatDate(user.createdAt)}</td>
                <td>
                  <div className="admin-actions">
                    <button 
                      className="admin-action-btn delete"
                      onClick={() => handleDelete(user._id)}
                      disabled={user.role === 'admin'} // No permitir eliminar administradores
                      title={user.role === 'admin' ? 'No se puede eliminar un administrador' : 'Eliminar usuario'}
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