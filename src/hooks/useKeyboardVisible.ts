import { useState, useEffect } from 'react';

/**
 * Hook para detectar si el teclado virtual está visible en dispositivos móviles.
 * Utiliza visualViewport como método principal y resize como fallback.
 */
export function useKeyboardVisible() {
  const [isKeyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    let hideTimeout: number | undefined;

    const updateState = (visible: boolean) => {
      if (visible) {
        // Immediate show (Snap Open)
        if (hideTimeout) clearTimeout(hideTimeout);
        setKeyboardVisible(true);
      } else {
        // Debounced hide (150ms)
        if (hideTimeout) clearTimeout(hideTimeout);
        hideTimeout = window.setTimeout(() => {
          setKeyboardVisible(false);
        }, 150);
      }
    };

    const checkKeyboardPresence = () => {
      // Método principal: visualViewport
      if (window.visualViewport) {
        const isViewportShrunk = window.visualViewport.height < window.innerHeight * 0.85;
        if (isViewportShrunk) return updateState(true);
      }

      // Método secundario: Focus de inputs (Fallback iOS/Android legacy)
      const activeElement = document.activeElement;
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' || 
        activeElement.tagName === 'TEXTAREA' || 
        (activeElement as HTMLElement).isContentEditable
      );

      if (isInputFocused) {
        return updateState(true);
      }

      // Si no entra en ninguna condición directa de activación, ordenamos ocultar
      updateState(false);
    };

    // Listeners
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', checkKeyboardPresence);
    }
    window.addEventListener('focusin', checkKeyboardPresence);
    window.addEventListener('focusout', checkKeyboardPresence);
    window.addEventListener('resize', checkKeyboardPresence);

    // Initial check
    checkKeyboardPresence();

    return () => {
      if (hideTimeout) clearTimeout(hideTimeout);
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', checkKeyboardPresence);
      }
      window.removeEventListener('focusin', checkKeyboardPresence);
      window.removeEventListener('focusout', checkKeyboardPresence);
      window.removeEventListener('resize', checkKeyboardPresence);
    };
  }, []);

  return isKeyboardVisible;
}
