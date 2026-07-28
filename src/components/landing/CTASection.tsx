import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui';

export function CTASection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-700 via-blue-800 to-slate-900 px-6 py-16 text-center sm:px-12"
        >
          <div className="hero-mesh absolute inset-0 opacity-40" />
          <div className="relative">
            <h2 className="text-3xl font-bold text-white sm:text-4xl">
              Ready to make your city smarter?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-blue-100/80">
              Join thousands of citizens and officers using JanSetu AI to resolve civic issues faster.
              Create your free account in seconds.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/signup">
                <Button size="lg" variant="secondary" rightIcon={<ArrowRight className="h-4 w-4" />}>
                  Get started free
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" className="border border-white/30 bg-white/10 text-white hover:bg-white/20">
                  Sign in
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
