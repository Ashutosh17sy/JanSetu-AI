import { Link } from 'react-router-dom';
import { Home, ArrowLeft, Compass } from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

export function NotFoundPage() {
  const { profile } = useAuth();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 px-6 text-center">
      <div className="hero-mesh absolute inset-0 -z-10 opacity-50" />
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-xl">
        <Compass className="h-10 w-10" />
      </div>
      <p className="mt-8 text-6xl font-bold text-slate-900 dark:text-white">404</p>
      <p className="mt-3 text-lg font-semibold text-slate-700 dark:text-slate-200">Page not found</p>
      <p className="mt-1 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex gap-3">
        <Link to={profile ? '/app' : '/'}>
          <Button leftIcon={<Home className="h-4 w-4" />}>Back home</Button>
        </Link>
        <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />} onClick={() => history.back()}>
          Go back
        </Button>
      </div>
    </div>
  );
}
