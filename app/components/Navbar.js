'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import ThemeToggle from './ThemeToggle';
import BionicReader from './BionicReader';
import './Navbar.css';

export default function Navbar() {
  const { data: session, status } = useSession();
  const loading = status === 'loading';

  return (
    <nav className="navbar">
      <div className="container">
        <Link href="/" className="logo">Kalat</Link>
        <div className="menu">
          <Link href="/" className="menu-item">Inicio</Link>
          <div className="nav-toggles">
            <ThemeToggle />
            <BionicReader />
          </div>
          {!loading && !session ? (
            <>
              <Link href="/login" className="menu-item">Iniciar Sesión</Link>
              <Link href="/register" className="menu-item register-btn">Registrarse</Link>
            </>
          ) : (
            <>
              <Link href="/new-post" className="menu-item">Nuevo Post</Link>
              <Link href="/profile" className="menu-item">
                <div className="user-profile-nav">
                  <span className="user-name">{session?.user?.name}</span>
                  {session?.user?.image ? (
                    <img src={session.user.image} alt={session.user.name} className="user-avatar" />
                  ) : (
                    <div className="user-avatar-placeholder">
                      {session?.user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })} 
                className="menu-item logout-btn"
              >
                Cerrar Sesión
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
} 