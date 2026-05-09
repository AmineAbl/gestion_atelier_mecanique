import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ArrowUp, Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
  const { isDark } = useTheme();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className={`mt-16 py-12 px-6 border-t-2 transition-colors duration-300 ${
        isDark
          ? 'bg-slate-950 border-white/10'
          : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div className={`${isDark ? 'text-white' : 'text-black'}`}>
            <h3 className="text-2xl font-bold mb-2">AutoPro</h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Gestion complète de votre atelier mécanique
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Liens rapides
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Factures</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Clients</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Rapports</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Réparations</a></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Support
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              <li className="flex items-center gap-2"><Mail className="w-4 h-4 flex-shrink-0" /><a href="#" className="hover:opacity-70 transition-opacity">Contact</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Documentation</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">Contact</a></li>
              <li><a href="#" className="hover:opacity-70 transition-opacity">FAQ</a></li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={`my-8 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2026 AutoPro Management. Tous les droits réservés.
          </div>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <button
              onClick={scrollToTop}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark
                  ? 'bg-white/10 hover:bg-white/20 text-white'
                  : 'bg-black/10 hover:bg-black/20 text-black'
              }`}
              aria-label="Scroll to top"
              title="Back to top"
            >
              <ArrowUp className="w-5 h-5" strokeWidth={2.5} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
