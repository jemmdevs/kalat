'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import '../auth.css';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false
      });

      if (result.error) {
        setError('Email o contraseña incorrectos');
        setLoading(false);
        return;
      }

      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Error de inicio de sesión', error);
      setError('Ocurrió un error al intentar iniciar sesión');
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <main>
        <div className="auth-container">
          <div className="auth-card">
            <h1 className="auth-title">Iniciar Sesión</h1>
            
            {error && <div className="auth-error">{error}</div>}
            
            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="password" className="form-label">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              
              <button type="submit" className="btn auth-btn" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
            
            <p className="auth-redirect">
              ¿No tienes una cuenta? <Link href="/register">Regístrate</Link>
            </p>
          </div>
        </div>
      </main>
    </>
  );
} 