import { Link } from 'wouter';
import { useTheme } from '@/lib/theme';
import { Home, Frown } from 'lucide-react';

export default function NotFound() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <div className="min-h-screen grid-bg flex items-center justify-center" style={{ background: isDark ? '#000' : '#f0f4f8' }}>
      <div className="text-center">
        <div className="text-[120px] font-black font-mono leading-none" style={{ color: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}>404</div>
        <Frown size={48} className="mx-auto mb-4" style={{ color: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)' }} />
        <h1 className="text-2xl font-bold mb-2" style={{ color: isDark ? '#fff' : '#0a0f1e' }}>Page Not Found</h1>
        <p className="text-sm mb-6" style={{ color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(10,15,30,0.5)' }}>This page doesn't exist in the job market.</p>
        <Link href="/">
          <button className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm mx-auto" style={{ background: 'linear-gradient(135deg, #0077ff, #00d4ff)', color: '#fff' }}>
            <Home size={16} /> Back to Home
          </button>
        </Link>
      </div>
    </div>
  );
}
