import { motion } from 'framer-motion';
import { Camera, BrainCircuit, Route, Wrench, CheckCircle2 } from 'lucide-react';

const STEPS = [
  {
    icon: Camera,
    title: '1. Snap & Submit',
    desc: 'A citizen photographs the civic issue. GPS location is captured automatically.',
  },
  {
    icon: BrainCircuit,
    title: '2. AI Analyses',
    desc: 'The AI detects the category, predicts severity & priority, and drafts a complaint title and description.',
  },
  {
    icon: Route,
    title: '3. Auto-Routed',
    desc: 'The complaint is assigned to the recommended department. Officers assign a field worker.',
  },
  {
    icon: Wrench,
    title: '4. Resolved',
    desc: 'The worker fixes the issue, uploads before/after photos, and the citizen rates the resolution.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">HOW IT WORKS</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            From photo to resolution in four steps
          </h2>
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6"
            >
              {i < STEPS.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-px w-6 -translate-y-1/2 translate-x-full bg-gradient-to-r from-slate-300 to-transparent dark:from-slate-700 lg:block" />
              )}
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                <s.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{s.title}</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

const AI_FEATURES = [
  'Detects complaint category from image & context',
  'Estimates severity (low / medium / high / critical)',
  'Predicts priority (low / normal / high / urgent)',
  'Generates complaint title & description',
  'Recommends the responsible department',
  'Detects duplicate complaints within 200m / 48h',
  'Produces an AI summary for officers',
];

export function AISection() {
  return (
    <section id="ai" className="relative overflow-hidden py-20 sm:py-28">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-blue-950/20 dark:via-slate-950 dark:to-teal-950/20" />
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">AI FEATURES</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              AI that does the triage for you
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              The moment a citizen uploads a photo, our analysis engine runs — classifying the issue,
              gauging its urgency, and routing it correctly. Officers review, not triage from scratch.
            </p>
            <ul className="mt-8 space-y-3">
              {AI_FEATURES.map((f, i) => (
                <motion.li
                  key={f}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: i * 0.06 }}
                  className="flex items-start gap-3"
                >
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-teal-500" />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{f}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-blue-500/15 to-teal-400/15 blur-2xl" />
            <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-xl">
              <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                <BrainCircuit className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-semibold text-slate-900 dark:text-white">AI Analysis Output</span>
              </div>
              <div className="mt-4 space-y-3 text-sm">
                {[
                  { k: 'Detected category', v: 'Road Potholes', tag: 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300' },
                  { k: 'Estimated severity', v: 'High', tag: 'bg-orange-100 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300' },
                  { k: 'Recommended dept.', v: 'Road Department', tag: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300' },
                  { k: 'Predicted priority', v: 'Urgent', tag: 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300' },
                ].map((row) => (
                  <div key={row.k} className="flex items-center justify-between">
                    <span className="text-slate-500 dark:text-slate-400">{row.k}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${row.tag}`}>{row.v}</span>
                  </div>
                ))}
                <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">AI Summary</p>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">
                    Road Potholes (high severity, urgent priority) auto-routed to Road Department. Recommend
                    immediate inspection per municipal SOP.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
