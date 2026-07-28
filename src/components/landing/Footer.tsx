import { Link } from 'react-router-dom';
import { Landmark, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-teal-500 text-white">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-bold text-slate-900 dark:text-white leading-none">JanSetu AI</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Smart Civic Management</p>
              </div>
            </Link>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-400 max-w-xs">
              An AI-powered Smart Civic Management Platform built for Municipal Corporations.
            </p>
            <div className="mt-4 flex gap-3">
              {[Github, Twitter, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700"
                  aria-label="Social link"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {[
            { title: 'Platform', links: ['Features', 'How it Works', 'AI', 'Pricing'] },
            { title: 'Roles', links: ['Citizen', 'Municipal Admin', 'Department Officer', 'Field Worker'] },
            { title: 'Company', links: ['About', 'Contact', 'Privacy Policy', 'Terms'] },
          ].map((col) => (
            <div key={col.title}>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{col.title}</p>
              <ul className="mt-4 space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-slate-200 dark:border-slate-800 pt-6 sm:flex-row">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} JanSetu AI. Built for a smarter India.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Made with care for Municipal Corporations.
          </p>
        </div>
      </div>
    </footer>
  );
}
