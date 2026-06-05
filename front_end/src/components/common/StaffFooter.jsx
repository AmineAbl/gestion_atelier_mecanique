import React from 'react';
import {
  ArrowUp,
  Calendar,
  ClipboardList,
  FileText,
  Mail,
  Phone,
  Settings,
  Users,
  UserCheck,
  Wrench,
  Package,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeToggle } from './ThemeToggle';

const footerConfig = {
  accountant: {
    title: 'Espace comptable',
    shortcuts: [
      { label: 'Apercu', action: 'overview', icon: ClipboardList },
      { label: 'Factures', action: 'invoices', icon: FileText },
      { label: 'Clients', action: 'clients', icon: Users },
      { label: 'Rapports', action: 'reports', icon: ClipboardList },
      { label: 'Calendrier', disabled: true, icon: Calendar },
    ],
    contacts: [
      { label: 'Responsable', type: 'email', value: 'responsable@atelier.local' },
      { label: 'Mecanicien', type: 'phone', value: '+212600000000' },
    ],
    roster: {
      label: 'Equipe',
      items: ['comptable1@atelier.local', 'comptable2@atelier.local'],
    },
  },
  manager: {
    title: 'Espace responsable',
    shortcuts: [
      { label: 'Apercu', action: 'overview', icon: ClipboardList },
      { label: 'Reparations', action: 'reparations', icon: Wrench },
      { label: 'Factures', action: 'factures', icon: FileText },
      { label: 'Clients', action: 'clients', icon: Users },
      { label: 'Pieces', action: 'pieces', icon: Package },
      { label: 'Calendrier', disabled: true, icon: Calendar },
    ],
    contacts: [
      { label: 'Responsable', type: 'email', value: 'responsable@atelier.local' },
      { label: 'Support', type: 'email', value: 'support@atelier.local' },
    ],
    roster: {
      label: 'Comptables disponibles',
      items: ['comptable1@atelier.local', 'comptable2@atelier.local'],
    },
  },
  mechanic: {
    title: 'Espace mecanicien',
    shortcuts: [
      { label: 'Apercu', action: 'overview', icon: ClipboardList },
      { label: 'Reparations', action: 'reparations', icon: Wrench },
      { label: 'Pieces', action: 'pieces', icon: Package },
      { label: 'Compte', action: 'account', icon: Settings },
      { label: 'Planning', disabled: true, icon: Calendar },
    ],
    contacts: [
      { label: 'Comptable', type: 'email', value: 'comptable@atelier.local' },
      { label: 'Responsable', type: 'email', value: 'responsable@atelier.local' },
    ],
    roster: {
      label: 'Comptables disponibles',
      items: ['comptable1@atelier.local', 'comptable2@atelier.local'],
    },
  },
};

export function StaffFooter({ role, onNavigate }) {
  const { isDark } = useTheme();
  const config = footerConfig[role] || footerConfig.accountant;

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderContact = (item) => {
    if (item.type === 'email') {
      return (
        <a
          href={`mailto:${item.value}`}
          className="hover:opacity-70 transition-opacity"
        >
          {item.value}
        </a>
      );
    }
    if (item.type === 'phone') {
      return (
        <a
          href={`tel:${item.value}`}
          className="hover:opacity-70 transition-opacity"
        >
          {item.value}
        </a>
      );
    }
    return item.value;
  };

  return (
    <footer
      className={`mt-16 py-12 px-6 border-t-2 transition-colors duration-300 ${
        isDark ? 'bg-slate-950 border-white/10' : 'bg-gray-50 border-gray-200'
      }`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div className={`${isDark ? 'text-white' : 'text-black'}`}>
            <img
    src={isDark ? '/logo_white.png' : '/logo_app_black.png'}
    alt="Mecindie"
    style={{ height: '40px', width: 'auto', objectFit: 'contain', marginBottom: '8px' }}
  />
  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
    {config.title}
  </p>
            
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Raccourcis
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.shortcuts.map((item) => {
                const Icon = item.icon;
                const disabled = Boolean(item.disabled);
                return (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => !disabled && item.action && onNavigate?.(item.action)}
                      disabled={disabled}
                      className={`flex items-center gap-2 transition-opacity ${
                        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-70'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                      {disabled ? ' (bientot)' : ''}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div>
            <h4 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-black'}`}>
              Contacts & equipe
            </h4>
            <ul className={`space-y-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {config.contacts.map((item) => (
                <li key={item.value} className="flex items-center gap-2">
                  {item.type === 'phone' ? (
                    <Phone className="w-4 h-4 flex-shrink-0" />
                  ) : (
                    <Mail className="w-4 h-4 flex-shrink-0" />
                  )}
                  <span className="font-semibold">{item.label}:</span>
                  {renderContact(item)}
                </li>
              ))}
              <li className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 flex-shrink-0" />
                <span className="font-semibold">{config.roster.label}:</span>
              </li>
              {config.roster.items.map((email) => (
                <li key={email} className="ml-6">
                  <a
                    href={`mailto:${email}`}
                    className="hover:opacity-70 transition-opacity"
                  >
                    {email}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={`my-8 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2026 MECINDIE Management. Tous les droits reserves.
          </div>
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
