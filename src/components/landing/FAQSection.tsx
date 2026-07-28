import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQS = [
  {
    q: 'How does the AI detect the complaint category?',
    a: 'When a citizen uploads a photo and optional note, our analysis engine evaluates the text context (note, address, ward, file name) against a trained category model covering all 13 civic issue types, then returns the best-matching category, estimated severity, predicted priority, and recommended department.',
  },
  {
    q: 'Do I need to install an app to file a complaint?',
    a: 'No. JanSetu AI is a fully responsive web app. Citizens can report issues from any phone or computer browser — no download required.',
  },
  {
    q: 'How are duplicate complaints handled?',
    a: 'The AI checks for existing open complaints of the same category within 200 metres and the last 48 hours. If a match is found, the new complaint is flagged as a potential duplicate for officers to review.',
  },
  {
    q: 'Which departments are supported?',
    a: 'Waste Management, Road, Traffic, Water, Sewer, Electricity, and Parks departments — covering all 13 complaint categories from garbage collection to fallen trees.',
  },
  {
    q: 'How do field workers receive tasks?',
    a: 'Department officers assign complaints to workers from their dashboard. Workers receive a real-time notification and can accept or reject the task, navigate via maps, and upload before/after photos to mark completion.',
  },
  {
    q: 'Is my data secure?',
    a: 'Yes. JanSetu AI uses row-level security so citizens only see their own complaints, officers see their department\'s scope, and admins see everything. Authentication is JWT-based with role-based access control.',
  },
];

export function FAQSection() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">FAQ</p>
          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            Frequently asked questions
          </h2>
        </div>

        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <div
              key={f.q}
              className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
              >
                <span className="font-medium text-slate-900 dark:text-white">{f.q}</span>
                <ChevronDown
                  className={`h-5 w-5 shrink-0 text-slate-400 transition-transform ${open === i ? 'rotate-180' : ''}`}
                />
              </button>
              <AnimatePresence>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <p className="px-5 pb-4 text-sm text-slate-600 dark:text-slate-400">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
