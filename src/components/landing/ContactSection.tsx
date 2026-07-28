import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send } from 'lucide-react';
import { Input, Textarea, Button } from '@/components/ui';
import { useToast } from '@/hooks/useToast';

export function ContactSection() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    setLoading(false);
    setForm({ name: '', email: '', message: '' });
    toast.success('Message sent', 'We will get back to you within 24 hours.');
  };

  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">CONTACT</p>
            <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
              Let's build a smarter city together
            </h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Whether you're a municipal corporation looking to deploy JanSetu AI or a citizen with feedback,
              we'd love to hear from you.
            </p>

            <div className="mt-8 space-y-4">
              {[
                { icon: Mail, label: 'Email', value: 'hello@jansetu.gov.in' },
                { icon: Phone, label: 'Phone', value: '+91-11-2200-1000' },
                { icon: MapPin, label: 'Address', value: 'Municipal Corporation HQ, New Delhi' },
              ].map((c) => (
                <div key={c.label} className="flex items-center gap-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
                    <c.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">{c.label}</p>
                    <p className="font-medium text-slate-900 dark:text-white">{c.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <Input
                label="Name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                required
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                required
              />
              <Textarea
                label="Message"
                placeholder="Tell us how we can help…"
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                required
              />
              <Button type="submit" className="w-full" loading={loading} leftIcon={<Send className="h-4 w-4" />}>
                Send message
              </Button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
