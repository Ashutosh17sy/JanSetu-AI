import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Landmark, ShieldCheck, Sparkles, MapPin } from 'lucide-react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Form side */}
      <div className="flex min-h-screen flex-col justify-center px-6 py-10 sm:px-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white shadow-lg shadow-blue-600/20">
              <Landmark className="h-5 w-5" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900 dark:text-white leading-none">JanSetu AI</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Smart Civic Management</p>
            </div>
          </Link>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-10"
          >
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400">{subtitle}</p>
          </motion.div>

          <div className="mt-8">{children}</div>
        </div>
      </div>

      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 lg:block">
        <div className="hero-mesh absolute inset-0" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="max-w-md space-y-4"
            >
              <h2 className="text-3xl font-bold leading-tight">
                AI-powered civic issue resolution for smarter cities.
              </h2>
              <p className="text-blue-100/80">
                Citizens snap a photo, AI detects the problem, predicts severity and routes it to the right
                department — automatically.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Sparkles, title: 'AI Auto-Detection', desc: 'Category, severity & priority' },
              { icon: MapPin, title: 'GPS + Maps', desc: 'Live complaint heatmap' },
              { icon: ShieldCheck, title: 'Role-Based Access', desc: 'Citizens, officers, workers' },
              { icon: Landmark, title: '7 Departments', desc: 'Waste to Parks — all covered' },
            ].map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur"
              >
                <f.icon className="h-6 w-6 text-blue-200" />
                <p className="mt-3 font-semibold">{f.title}</p>
                <p className="text-sm text-blue-100/70">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
