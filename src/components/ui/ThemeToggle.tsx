import { useState, useRef, useEffect } from 'react';
import { Sun, Moon, Check } from 'lucide-react';
import { useTheme } from '../../components/ThemeProvider';

export function ThemeToggle() {
  const { isDark, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all hover:bg-slate-100"
        style={{ backgroundColor: isDark ? '#161F2E' : undefined }}
        aria-label={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      >
        {isDark ? (
          <Moon className="w-5 h-5" style={{ color: '#7C5CFF' }} />
        ) : (
          <Sun className="w-5 h-5" style={{ color: '#475569' }} />
        )}
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-full mt-2 w-40 rounded-xl shadow-xl border overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          style={{ backgroundColor: isDark ? '#161F2E' : '#ffffff', borderColor: isDark ? '#223044' : '#e2e8f0' }}
        >
          <button
            onClick={() => { setTheme('light'); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: !isDark ? '#f8fafc' : 'transparent',
              color: !isDark ? '#0f172a' : '#A7B0C0'
            }}
          >
            <Sun className="w-4 h-4" style={{ color: !isDark ? '#475569' : '#6F7A8A' }} />
            <span className="flex-1 text-left">Modo Claro</span>
            {!isDark && <Check className="w-4 h-4" style={{ color: '#7C5CFF' }} />}
          </button>
          <button
            onClick={() => { setTheme('dark'); setIsOpen(false); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors"
            style={{ 
              backgroundColor: isDark ? '#0B0F14' : 'transparent',
              color: isDark ? '#EAF0FF' : '#64748b'
            }}
          >
            <Moon className="w-4 h-4" style={{ color: isDark ? '#7C5CFF' : '#64748b' }} />
            <span className="flex-1 text-left">Modo Oscuro</span>
            {isDark && <Check className="w-4 h-4" style={{ color: '#7C5CFF' }} />}
          </button>
        </div>
      )}
    </div>
  );
}