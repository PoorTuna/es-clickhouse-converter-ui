import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/useTheme';

export function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className="flex h-8 w-8 items-center justify-center rounded-md border border-ch-border text-ch-muted transition-colors hover:bg-ch-panel-2 hover:text-ch-text focus:outline-none focus-visible:ring-2 focus-visible:ring-ch-yellow/60"
    >
      {isDark ? <Sun size={16} /> : <Moon size={16} />}
    </button>
  );
}
