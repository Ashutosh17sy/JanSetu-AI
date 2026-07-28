import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Ananya Iyer',
    role: 'Citizen, Ward 12',
    text: 'I reported a pothole near my daughter\'s school and it was fixed in two days. The AI even flagged it as urgent. This is how a city should work.',
    rating: 5,
  },
  {
    name: 'Rajesh Kumar',
    role: 'Municipal Commissioner',
    text: 'JanSetu AI transformed how our corporation handles complaints. Duplicate detection alone saved our officers hundreds of hours.',
    rating: 5,
  },
  {
    name: 'Sunita Rao',
    role: 'Road Department Officer',
    text: 'The auto-routing means I only see complaints that actually belong to my department. The analytics dashboards are genuinely useful.',
    rating: 5,
  },
];

export function TestimonialsSection() {
  return (
    <section className="border-y border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/40 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">TESTIMONIALS</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Trusted by citizens and officers alike
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <Quote className="h-7 w-7 text-blue-200 dark:text-blue-900" />
              <blockquote className="mt-3 flex-1 text-sm text-slate-700 dark:text-slate-300">{t.text}</blockquote>
              <div className="mt-4 flex items-center gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <figcaption className="mt-4 border-t border-slate-100 dark:border-slate-800 pt-4">
                <p className="font-semibold text-slate-900 dark:text-white">{t.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  );
}
