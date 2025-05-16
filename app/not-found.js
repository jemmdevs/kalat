import Link from 'next/link';
import Navbar from './components/Navbar';
import './not-found.css';

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="not-found-container">
        <div className="not-found-content">
          <h1 className="not-found-title">404</h1>
          <h2 className="not-found-subtitle">Página no encontrada</h2>
          <p className="not-found-message">
            La página que estás buscando no existe o ha sido movida.
          </p>
          <Link href="/" className="btn not-found-btn">
            Volver al Inicio
          </Link>
        </div>
      </main>
    </>
  );
} 