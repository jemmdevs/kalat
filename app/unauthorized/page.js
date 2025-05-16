import Link from 'next/link';
import Navbar from '../components/Navbar';
import './unauthorized.css';

export default function Unauthorized() {
  return (
    <>
      <Navbar />
      <main>
        <div className="unauthorized-container">
          <h1 className="unauthorized-title">Acceso Denegado</h1>
          <div className="unauthorized-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          </div>
          <p className="unauthorized-message">
            No tienes permiso para acceder a esta página. Esta sección está reservada para administradores.
          </p>
          <Link href="/" className="btn unauthorized-btn">
            Volver al Inicio
          </Link>
        </div>
      </main>
    </>
  );
} 