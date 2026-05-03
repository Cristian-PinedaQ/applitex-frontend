import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
  setMode: (mode: ThemeMode) => void;
}

const getSystemTheme = () =>
  window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

const applyTheme = (resolved: 'light' | 'dark') => {
  document.documentElement.classList.toggle('dark', resolved === 'dark');
};

export const useThemeStore = create<ThemeState>((set) => {
  const stored = localStorage.getItem('theme') as ThemeMode | null;
  const systemTheme = getSystemTheme();
  const initialMode = stored || 'system';
  const initialResolved =
    initialMode === 'system' ? systemTheme : initialMode;

  applyTheme(initialResolved);

  return {
    mode: initialMode,
    resolved: initialResolved,
    setMode: (mode) => {
      localStorage.setItem('theme', mode);
      const resolved = mode === 'system' ? getSystemTheme() : mode;
      applyTheme(resolved);
      set({ mode, resolved });
    },
  };
});

if (typeof window !== 'undefined') {
  const media = window.matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener('change', () => {
    const { mode } = useThemeStore.getState();
    if (mode === 'system') {
      const resolved = getSystemTheme();
      applyTheme(resolved);
      useThemeStore.setState({ resolved });
    }
  });
}