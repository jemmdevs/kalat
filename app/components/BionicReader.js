'use client';

import { useState, useEffect } from 'react';

export default function BionicReader() {
  const [isBionicEnabled, setIsBionicEnabled] = useState(false);

  useEffect(() => {
    // Al cargar, verificar la preferencia guardada
    const bionicPreference = localStorage.getItem('bionicReader');
    if (bionicPreference === 'enabled') {
      setIsBionicEnabled(true);
      applyBionicReader(true);
    }
  }, []);

  const toggleBionicReader = () => {
    const newState = !isBionicEnabled;
    setIsBionicEnabled(newState);
    applyBionicReader(newState);
    localStorage.setItem('bionicReader', newState ? 'enabled' : 'disabled');
  };

  const applyBionicReader = (enabled) => {
    if (enabled) {
      document.body.classList.add('bionic-mode');
      // Procesar todos los párrafos existentes
      processParagraphs();
    } else {
      document.body.classList.remove('bionic-mode');
      // Restaurar el contenido original
      restoreOriginalContent();
    }
  };

  const processParagraphs = () => {
    // Seleccionar elementos donde aplicar Bionic Reader
    const elements = document.querySelectorAll('.post-content p, .post-excerpt, .post-paragraph');
    
    elements.forEach(element => {
      // Guardar el contenido original para poder restaurarlo
      if (!element.dataset.originalContent) {
        element.dataset.originalContent = element.innerHTML;
      }
      
      // Aplicar formato bionic a cada palabra
      const content = element.textContent;
      element.innerHTML = bionicFormat(content);
      element.classList.add('bionic-text');
    });
  };

  const restoreOriginalContent = () => {
    const elements = document.querySelectorAll('.bionic-text');
    
    elements.forEach(element => {
      if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
      }
      element.classList.remove('bionic-text');
    });
  };

  const bionicFormat = (text) => {
    if (!text) return '';
    
    return text.split(' ').map(word => {
      if (word.length <= 1) return word;
      
      // Determinar cuántos caracteres poner en negrita
      const boldLength = Math.ceil(word.length / 2);
      
      // Dividir la palabra en parte bold y parte normal
      const boldPart = word.substring(0, boldLength);
      const normalPart = word.substring(boldLength);
      
      return `<span class="bionic-bold">${boldPart}</span><span class="bionic-normal">${normalPart}</span>`;
    }).join(' ');
  };

  return (
    <button 
      className="bionic-toggle" 
      onClick={toggleBionicReader}
      aria-label={`${isBionicEnabled ? 'Desactivar' : 'Activar'} modo de lectura bionic`}
    >
      {/* Icono de Bionic Reader (un "B" estilizado) */}
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 4H14C16.2091 4 18 5.79086 18 8C18 10.2091 16.2091 12 14 12H6V4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M6 12H14C16.2091 12 18 13.7909 18 16C18 18.2091 16.2091 20 14 20H6V12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
} 