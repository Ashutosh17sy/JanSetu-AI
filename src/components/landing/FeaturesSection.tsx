import { motion } from 'framer-motion';
import {
  Camera,
  Brain,
  Route,
  Map as MapIcon,
  Bell,
  BarChart3,
  ShieldCheck,
  Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Camera,
    title: 'Photo-based Reporting',
    desc: 'Citizens snap a picture of the issue — no forms to fumble through. Image + GPS is all we need.',
  },
  {
    icon: Brain,
    title: 'AI Auto-Classification',
    desc: 'Our AI detects the complaint category, estimates severity, and predicts priority automatically.',
  },
  {
    icon: Route,
    title: 'Smart Department Routing',
    desc: 'Complaints are routed to the correct municipal department with zero manual triage.',
  },
  {
    icon: MapIcon,
    title: 'Interactive Maps & Heatmap',
    desc: 'See every complaint on a live map. Identify hotspots and ward-wise problem density at a glance.',
  },
  {
    icon: Bell,
    title: 'Real-time Notifications',
    desc: 'Citizens, officers and workers stay in sync with instant status updates at every stage.',
  },
  {
    icon: BarChart3,
    title: 'Analytics & Reports',
    desc: 'Department performance, resolution times, ward-wise reports and monthly trends — all visualised.',
  },
  {
    icon: ShieldCheck,
    title: 'Role-Based Access',
    desc: 'Granular permissions for citizens, admins, department officers and field workers.',
  },
  {
    icon: Users,
    title: 'Worker Task Management',
    desc: 'Field workers accept tasks, navigate via maps, upload before/after photos and mark completion.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">FEATURES</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Everything a smart city needs, in one platform
          </h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400">
            From citizen reporting to worker dispatch and analytics — JanSetu AI covers the entire civic
            complaint lifecycle.
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-600/5"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 text-blue-600 dark:from-blue-950/40 dark:to-teal-950/40 dark:text-blue-400 transition-transform group-hover:scale-110">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-base font-semibold text-slate-900 dark:text-white">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
