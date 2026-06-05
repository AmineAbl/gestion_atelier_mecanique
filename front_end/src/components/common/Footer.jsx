import React from 'react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';
import { ArrowUp, Mail, Phone, MapPin, Shield, HelpCircle, FileText, ExternalLink } from 'lucide-react';

export function Footer() {
  const { isDark } = useTheme();

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const linkClass = `hover:opacity-70 transition-opacity cursor-pointer`;
  const textMuted = isDark ? 'text-gray-400' : 'text-gray-600';
  const textHeading = isDark ? 'text-white' : 'text-gray-900';

  return (
    <footer
      className={`mt-16 py-12 px-6 border-t-2 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-white/10' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 mb-10">

          <div className="space-y-3">
            <img
              src={isDark ? '/logo_white.png' : '/logo_app_black.png'}
              alt="Mecindie"
              style={{ height: '40px', width: 'auto', objectFit: 'contain' }}
            />
            <p className={`text-sm leading-relaxed ${textMuted}`}>
              La plateforme tout-en-un pour gérer votre atelier mécanique — réparations, clients, factures et finances.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className={`text-xs ${textMuted}`}>Plateforme opérationnelle</span>
            </div>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wide ${textHeading}`}>
              Navigation
            </h4>
            <ul className={`space-y-2.5 text-sm ${textMuted}`}>
              <li><a href="#features" className={linkClass}>Fonctionnalités</a></li>
              <li><a href="#pricing" className={linkClass}>Tarifs</a></li>
              <li><a href="#contact" className={linkClass}>Demander une démo</a></li>
              <li><a href="#stats" className={linkClass}>Chiffres clés</a></li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wide ${textHeading}`}>
              Informations
            </h4>
            <ul className={`space-y-2.5 text-sm ${textMuted}`}>
              <li>
                <a href="#privacy" className={`flex items-center gap-2 ${linkClass}`}>
                  <Shield className="w-3.5 h-3.5 flex-shrink-0" />
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#faq" className={`flex items-center gap-2 ${linkClass}`}>
                  <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  FAQ
                </a>
              </li>
              <li>
                <a href="#terms" className={`flex items-center gap-2 ${linkClass}`}>
                  <FileText className="w-3.5 h-3.5 flex-shrink-0" />
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#contact" className={`flex items-center gap-2 ${linkClass}`}>
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  Nous contacter
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 text-sm uppercase tracking-wide ${textHeading}`}>
              Localisation
            </h4>
            <ul className={`space-y-3 text-sm ${textMuted}`}>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-red-400" />
                <span className="leading-snug">
                  Bd Abdelkrim Al Khattabi,<br />
                  Guéliz — devant FST<br />
                  <span className="font-medium">Marrakech, Maroc</span>
                </span>
              </li>
              <li>
  <a
    href="https://maps.google.com/?q=Bd+Abdelkrim+Al+Khattabi+Gueliz+Marrakech"
    target="_blank"
    rel="noopener noreferrer"
    className={`flex items-center gap-2 text-blue-400 hover:text-blue-300 hover:opacity-70 transition-opacity cursor-pointer`}
  >
    <ExternalLink className="w-3.5 h-3.5" />
    Voir sur Google Maps
  </a>
</li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                <a href="tel:+212600000000" className={linkClass}>+212 6 00 00 00 00</a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                <a href="mailto:contact@mecindie.ma" className={linkClass}>contact@mecindie.ma</a>
              </li>
            </ul>
          </div>

        </div>

        <div className={`border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6">
          <div className={`text-xs ${textMuted} text-center md:text-left`}>
            © 2026 <span className="font-semibold">Mecindie</span>. Tous droits réservés. — Fait avec ♥ à Marrakech
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-xs ${textMuted}`}>v1.0.0</span>
            <ThemeToggle />
            <button
              onClick={scrollToTop}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                isDark ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-black/10 hover:bg-black/20 text-black'
              }`}
              aria-label="Retour en haut"
              title="Retour en haut"
            >
              <ArrowUp className="w-4 h-4" strokeWidth={2.5} />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
}