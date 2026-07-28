import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, MapPin, Camera, ShieldCheck, Bell, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="hero-mesh absolute inset-0 -z-10" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-transparent via-transparent to-white dark:to-slate-950" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/40 px-3 py-1 text-xs font-medium text-blue-700 dark:text-blue-300">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Civic Management
            </div>

            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl">
              Report. Detect.{' '}
              <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Resolve.</span>
              <br />
              Smarter cities, powered by AI.
            </h1>

            <p className="mt-6 max-w-xl text-lg text-slate-600 dark:text-slate-300">
              JanSetu AI lets citizens snap a photo of any civic issue. Our AI instantly detects the problem,
              predicts severity, and routes it to the right municipal department — so cities respond faster.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/signup">
                <Button size="lg" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Report an issue
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">
                  Officer login
                </Button>
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500 dark:text-slate-400">
              {[
                { icon: ShieldCheck, label: 'Role-based secure access' },
                { icon: MapPin, label: 'GPS + live maps' },
                { icon: Bell, label: 'Real-time notifications' },
              ].map((i) => (
                <div key={i.label} className="flex items-center gap-2">
                  <i.icon className="h-4 w-4 text-teal-500" />
                  {i.label}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Visual mockup */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="relative"
          >
            <div className="relative mx-auto max-w-md">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/20 to-teal-400/20 blur-2xl" />
              <div className="relative rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-2xl shadow-blue-600/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Camera className="h-5 w-5 text-blue-600" />
                    <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Complaint Analysis</span>
                  </div>
                  <span className="rounded-full bg-emerald-100 dark:bg-emerald-950/40 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    Analyzing…
                  </span>
                </div>

                <div className="mt-4 aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700">
                  <img
                    src="https://images.pexels.com/photos/259915/pexels-photo-259915.jpeg?auto=compress&cs=tinysrgb&w=800"
                    alt="Civic issue sample"
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 }}
                  className="mt-4 space-y-2"
                >
                  {[
                    { label: 'Category', value: 'Road Potholes', color: 'text-blue-600' },
                    { label: 'Severity', value: 'High', color: 'text-orange-600' },
                    { label: 'Department', value: 'Road Department', color: 'text-teal-600' },
                    { label: 'Priority', value: 'Urgent', color: 'text-rose-600' },
                  ].map((row) => (
                    <div key={row.label} className="flex items-center justify-between text-sm">
                      <span className="text-slate-500 dark:text-slate-400">{row.label}</span>
                      <span className={`font-semibold ${row.color}`}>{row.value}</span>
                    </div>
                  ))}
                </motion.div>
              </div>

              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-4 -top-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl"
              >
                <TrendingUp className="h-5 w-5 text-emerald-500" />
                <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">+38% faster</p>
                <p className="text-[10px] text-slate-500">resolution time</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
