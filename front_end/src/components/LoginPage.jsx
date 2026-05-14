import { useState } from 'react';
import { ArrowLeft, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import styles from './LoginPage.module.css';
import { loginWithApiOrDemo } from '../utils/authLogin';
import { useTheme } from '../context/ThemeContext';

export default function LoginPage({ onLoginSuccess, onBackToHome }) {
  const { isDark } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setIsLoading(true);
    try {
      const userData = await loginWithApiOrDemo(email, password);
      onLoginSuccess(userData);
    } catch (err) {
      setError(err.message || 'Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${isDark ? styles.containerDark : ''}`}>
      <div className={`${styles.bgGrid} ${isDark ? styles.bgGridDark : ''}`}></div>
      <div className={`${styles.bgGlow} ${isDark ? styles.bgGlowDark : ''}`}></div>
      <div className={styles.wrapper}>
        <button
          type="button"
          className={`${styles.backLink} ${isDark ? styles.backLinkDark : ''}`}
          onClick={onBackToHome}
          disabled={isLoading}
        >
          <ArrowLeft size={18} aria-hidden />
          Retour à l’accueil
        </button>

        <div className={`${styles.header} ${isDark ? styles.headerDark : ''}`}>
          <div className={styles.logo}>
            <div className={`${styles.logoIcon} ${isDark ? styles.logoIconDark : ''}`}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 1 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
              </svg>
            </div>
            <h1 className={`${styles.title} ${isDark ? styles.titleDark : ''}`}>MecanicHub</h1>
          </div>
          <p className={`${styles.subtitle} ${isDark ? styles.subtitleDark : ''}`}>Connexion — accès à votre espace</p>
        </div>

        <motion.div
          className={`${styles.card} ${isDark ? styles.cardDark : ''}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className={`${styles.heading} ${isDark ? styles.headingDark : ''}`}>Se connecter</h2>

          <form onSubmit={handleLogin} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="email" className={`${styles.label} ${isDark ? styles.labelDark : ''}`}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                className={`${styles.input} ${isDark ? styles.inputDark : ''}`}
                autoComplete="username"
                disabled={isLoading}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="password" className={`${styles.label} ${isDark ? styles.labelDark : ''}`}>
                Mot de passe
              </label>
              <div className={styles.passwordWrapper}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`${styles.input} ${isDark ? styles.inputDark : ''}`}
                  autoComplete="current-password"
                  disabled={isLoading}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`${styles.passwordToggle} ${isDark ? styles.passwordToggleDark : ''}`}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                >
                  {showPassword ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-4.5-11-4.5s1.6-2.3 4.3-4m2.6-2.6A5 5 0 0 1 12 4c7 0 11 4.5 11 4.5s-1.6 2.3-4.3 4"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && <div className={`${styles.error} ${isDark ? styles.errorDark : ''}`}>{error}</div>}

            <div className={`${styles.options} ${isDark ? styles.optionsDark : ''}`}>
              <label className={`${styles.checkbox} ${isDark ? styles.checkboxDark : ''}`}>
                <input type="checkbox" defaultChecked />
                <span>Se souvenir de moi</span>
              </label>
              <span className={`${styles.linkMuted} ${isDark ? styles.linkMutedDark : ''}`}>Mot de passe oublié : contactez le responsable.</span>
            </div>

            <button type="submit" disabled={isLoading} className={`${styles.submitBtn} ${isDark ? styles.submitBtnDark : ''}`}>
              {isLoading ? (
                <span className={styles.loadingState}>
                  <Loader className={styles.spinnerIcon} size={20} />
                  Connexion…
                </span>
              ) : (
                'Se connecter'
              )}
            </button>

            <div className={`${styles.hintBox} ${isDark ? styles.hintBoxDark : ''}`}>
              <p className={`${styles.hintTitle} ${isDark ? styles.hintTitleDark : ''}`}>Comptes de démonstration</p>
              <ul className={`${styles.hintList} ${isDark ? styles.hintListDark : ''}`}>
                <li><strong>Responsable</strong> (un seul compte) : responsable@atelier.com / password123</li>
                <li><strong>Comptable</strong> : comptable@atelier.com / password123</li>
              </ul>
            </div>
          </form>
        </motion.div>

        <p className={`${styles.footer} ${isDark ? styles.footerDark : ''}`}>© 2026 MecanicHub. Tous droits réservés.</p>
      </div>
    </div>
  );
}
