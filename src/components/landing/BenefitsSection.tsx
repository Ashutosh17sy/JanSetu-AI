import { motion } from 'framer-motion';
import { Zap, Clock, TrendingDown, Heart, Users, MapPin } from 'lucide-react';

const BENEFITS = [
  { icon: Zap, title: 'Faster Response', desc: 'Auto-routing and prioritisation cut average resolution time dramatically.' },
  { icon: TrendingDown, title: 'Fewer Duplicate Complaints', desc: 'AI flags duplicates within 200m and 48h — officers focus on unique issues.' },
  { icon: Clock, title: '24/7 Reporting', desc: 'Citizens file complaints anytime; AI triage never sleeps.' },
  { icon: MapPin, title: 'Data-Driven Decisions', desc: 'Heatmaps and ward reports reveal where the city needs attention most.' },
  { icon: Users, title: 'Citizen Engagement', desc: 'Transparent tracking and feedback build trust between citizens and the corporation.' },
  { icon: Heart, title: 'Better Quality of Life', desc: 'Cleaner streets, safer roads, working lights — a city that works for everyone.' },
];

export function BenefitsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">BENEFITS</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Why municipalities choose JanSetu AI
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={b.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.06 }}
              className="flex gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600 dark:bg-teal-950/40 dark:text-teal-400">
                <b.icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 dark:text-white">{b.title}</h3>
                <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{b.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
