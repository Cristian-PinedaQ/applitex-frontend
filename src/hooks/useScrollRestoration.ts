import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para gestionar la restauración de scroll en SPAs.
 * Guarda la posición de scroll por cada ruta (incluyendo filtros) en sessionStorage.
 */
export function useScrollRestoration() {
  const { pathname, search } = useLocation();
  const key = `scroll:${pathname}${search}`;

  useLayoutEffect(() => {
    // Restaurar scroll al montar la ruta con los filtros específicos
    const scrollY = sessionStorage.getItem(key);
    if (scrollY) {
      window.scrollTo(0, parseInt(scrollY, 10));
    } else {
      window.scrollTo(0, 0);
    }
  }, [key]);

  useEffect(() => {
    const handleScroll = () => {
      // Guardar scroll indexado por ruta y parámetros de búsqueda
      sessionStorage.setItem(key, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [key]);
}
