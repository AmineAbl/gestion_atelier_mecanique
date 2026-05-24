import React, { useState, useEffect } from 'react';
import { Wrench, ArrowRight, Gauge, TrendingUp, Lock, Star, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { PerspectiveMarquee } from '../common/PerspectiveMarquee';
import LandingFooter from './LandingFooter';
import './LandingPage.css';

const AnimatedNumber = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count}+</span>;
};

const HandWrittenTitle = ({ title, subtitle }) => {
  const draw = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { duration: 2.5, ease: [0.43, 0.13, 0.23, 0.96] },
        opacity: { duration: 0.5 },
      },
    },
  };

  return (
    <div className="hero-title-wrap">
      <div className="hero-title-path">
        <motion.svg
          width="100%"
          height="100%"
          viewBox="0 0 1400 320"
          initial="hidden"
          animate="visible"
          className="hero-title-svg"
        >
          <motion.path
            d="M 1260 70 C 1480 180, 1260 290, 700 300 C 320 300, 140 240, 120 150 C 110 70, 360 20, 700 20 C 1020 20, 1200 90, 1260 150"
            fill="none"
            strokeWidth="10"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            variants={draw}
            className="hero-title-stroke"
          />
        </motion.svg>
      </div>
      <div className="hero-title-text">
        <motion.h1
          className="hero-title animate-blur-in"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          {title}
        </motion.h1>
        {subtitle ? (
          <motion.p
            className="hero-subtitle animate-fade-in-up-delay-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            {subtitle}
          </motion.p>
        ) : null}
      </div>
    </div>
  );
};

export default function LandingPage({ onGoToLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [formStatus, setFormStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const [captcha, setCaptcha] = useState(() => {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    return { a, b, answer: a + b };
  });

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    {
      icon: Wrench,
      title: 'Gestion Intelligente des Réparations',
      description: 'Orchestrez l\'intégralité de votre flux de réparation automobile. Suivi des pièces détachées, planification des techniciens, gestion des stocks et historique véhicule en un tableau de bord intuitif.',
    },
    {
      icon: Gauge,
      title: 'Automatisation Complète des Processus',
      description: 'Éliminez les tâches manuelles. Factures auto-générées à partir des réparations, rappels de paiement automatisés, devis numériques et planification optimisée pour gagner des heures chaque semaine.',
    },
    {
      icon: TrendingUp,
      title: 'Visibilité Totale sur vos Opérations',
      description: 'Temps réel, toujours. Suivi en direct de chaque réparation, notifications instantanées des changements de statut, et rapports financiers détaillés pour une gestion sans surprise.',
    },
    {
      icon: Lock,
      title: 'Confiance & Conformité RGPD',
      description: 'Données client sécurisées avec chiffrement de grade entreprise. Conformité RGPD garantie, sauvegardes automatiques et accès contrôlé par rôle (comptable, mécanicien).',
    },
  ];

  const pricingTiers = [
    {
      name: 'Standard',
      price: 299,
      badge: 'Essentiel',
      description: 'Pour les ateliers qui veulent un flux propre et fiable.',
      highlight: false,
      features: [
        'Gestion reparations + pieces',
        'Factures et clients illimites',
        'Planning simple des techniciens',
        'Support email standard',
      ],
      icon: Star,
    },
    {
      name: 'Pro',
      price: 599,
      badge: 'Recommande',
      description: 'Pour les equipes qui veulent des rapports et alertes avancees.',
      highlight: true,
      features: [
        'Tableaux financiers avancees',
        'Alertes statut et paiement',
        'Acces multi-roles optimise',
        'Support prioritaire',
      ],
      icon: Sparkles,
    },
  ];

  const handleContactSubmit = (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const trap = String(data.get('website') || '').trim();
    const captchaValue = Number(data.get('captcha'));

    if (trap) {
      setFormStatus('error');
      setFormError('Requete bloquee. Veuillez reessayer.');
      return;
    }

    if (Number.isNaN(captchaValue) || captchaValue !== captcha.answer) {
      setFormStatus('error');
      setFormError('Verification incorrecte. Reessayez.');
      const a = Math.floor(Math.random() * 8) + 2;
      const b = Math.floor(Math.random() * 8) + 2;
      setCaptcha({ a, b, answer: a + b });
      return;
    }

    setFormStatus('sent');
    setFormError('');
    form.reset();
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 2;
    setCaptcha({ a, b, answer: a + b });
    setTimeout(() => setFormStatus('idle'), 4000);
  };

  const scrollToContact = () => {
    const section = document.getElementById('contact');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="landing-page">
      {/* Animated Background Grid */}
      <div className="background-grid"></div>
      <div className="background-glow"></div>

      {/* Floating Header */}
      <header className={`floating-header ${isScrolled ? 'scrolled' : ''}`}>
        <nav className="nav-container">
          <div className="logo">
            <Wrench className="logo-icon" />
            <span className="logo-text">AutoPro</span>
          </div>
          <button type="button" onClick={onGoToLogin} className="login-button">
            Se connecter
            <ArrowRight className="button-icon" />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in-up">
          <HandWrittenTitle
            title="Votre Atelier Maîtrise"
            subtitle="La plateforme tout-en-un pour gérer réparations automobile, clients, factures et finances. Optimisez votre flux d'atelier, augmentez votre rentabilité."
          />

          <button type="button" className="cta-button animate-fade-in-up-delay-2" onClick={onGoToLogin}>
            <span>Accéder à votre tableau de bord</span>
            <ArrowRight className="cta-icon" />
          </button>
        </div>

        {/* Animated Dot Matrix Background Effect in Hero */}
        <div className="hero-decoration animate-float-in">
          <div className="dots-grid"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section" id="features">
        <div className="features-header animate-fade-in">
          <h2 className="features-title">Pourquoi choisir AutoPro ?</h2>
          <p className="features-subtitle">
            Des outils puissants conçus pour votre atelier
          </p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon;
            return (
              <div
                key={index}
                className="feature-card animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="feature-icon-wrapper">
                  <IconComponent className="feature-icon" />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trusted By Section - Marquee */}
      <section className="marquee-showcase-section">
        <div className="marquee-overlay">
          <div className="marquee-label animate-fade-in">Trusted by leading automotive brands</div>
          <PerspectiveMarquee
            items={['Bosch', 'Michelin', 'Continental', 'Castrol', 'Volkswagen', 'Renault', 'Peugeot', 'Audi', 'BMW', 'Mercedes']}
            fontSize={42}
            color="rgba(255, 255, 255, 0.8)"
            background="transparent"
            fadeColor="transparent"
            rotateY={-28}
            rotateX={8}
            perspective={1200}
            className="marquee-custom"
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section animate-fade-in" id="stats">
        <div className="stats-container">
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number"><AnimatedNumber end={500} duration={2.5} /></div>
            <div className="stat-label">Ateliers Partenaires</div>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number"><AnimatedNumber end={850} duration={2.5} />K</div>
            <div className="stat-label">Réparations Gérées</div>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat-number">99.9%</div>
            <div className="stat-label">Disponibilité Plateforme</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pricing-section" id="pricing">
        <div className="pricing-header animate-fade-in">
          <div className="pricing-tag">Tarifs clairs</div>
          <h2 className="pricing-title">Choisissez le plan qui suit votre rythme</h2>
          <p className="pricing-subtitle">Deux offres, un meme objectif : un atelier plus rentable.</p>
        </div>

        <div className="pricing-grid">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            return (
              <div
                key={tier.name}
                className={`pricing-card animate-fade-in ${tier.highlight ? 'highlight' : ''}`}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="pricing-card-header">
                  <div className="pricing-icon"><Icon /></div>
                  <span className="pricing-badge">{tier.badge}</span>
                </div>
                <h3 className="pricing-plan">{tier.name}</h3>
                <p className="pricing-description">{tier.description}</p>
                <div className="pricing-price">
                  <span className="price-value">{tier.price}</span>
                  <span className="price-unit">MAD / mois</span>
                </div>
                <ul className="pricing-features">
                  {tier.features.map((feature) => (
                    <li key={feature}>{feature}</li>
                  ))}
                </ul>
                <button type="button" className="pricing-cta" onClick={scrollToContact}>
                  Demander une demo
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className="contact-section" id="contact">
        <div className="contact-content">
          <div className="contact-copy">
            <div className="contact-tag">Demande d'accompagnement</div>
            <h2 className="contact-title">Parlons de votre atelier</h2>
            <p className="contact-subtitle">
              Recevez une demo personnalisee et un plan d'integration adapte a votre flux de travail.
            </p>
            <div className="contact-highlights">
              <div className="contact-highlight">Mise en place rapide</div>
              <div className="contact-highlight">Equipe dediee</div>
              <div className="contact-highlight">Support prioritaire</div>
            </div>
          </div>

          <form className="contact-form" onSubmit={handleContactSubmit}>
            <div className="honeypot-field" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" name="website" type="text" tabIndex="-1" autoComplete="off" />
            </div>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="fullName">Nom complet</label>
                <input id="fullName" name="fullName" type="text" placeholder="Nom et prenom" required />
              </div>
              <div className="form-field">
                <label htmlFor="email">Email professionnel</label>
                <input id="email" name="email" type="email" placeholder="vous@atelier.com" required />
              </div>
              <div className="form-field">
                <label htmlFor="phone">Telephone</label>
                <input id="phone" name="phone" type="tel" placeholder="+2126 00 00 00 00" />
              </div>
              <div className="form-field">
                <label htmlFor="workshop">Nom de l'atelier</label>
                <input id="workshop" name="workshop" type="text" placeholder="Garage Atlas" required />
              </div>
              <div className="form-field">
                <label htmlFor="plan">Plan souhaite</label>
                <select id="plan" name="plan" defaultValue="Standard">
                  <option>Standard</option>
                  <option>Pro</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="team">Taille d'equipe</label>
                <select id="team" name="team" defaultValue="1-5">
                  <option>1-5</option>
                  <option>6-15</option>
                  <option>16-30</option>
                  <option>30+</option>
                </select>
              </div>
            </div>
            <div className="form-field">
              <label htmlFor="message">Vos besoins</label>
              <textarea
                id="message"
                name="message"
                rows={4}
                placeholder="Expliquez votre contexte et vos attentes."
              />
            </div>
            <div className="form-field">
              <label htmlFor="captcha">Verification simple</label>
              <div className="captcha-row">
                <span className="captcha-label">Combien font {captcha.a} + {captcha.b} ?</span>
                <input id="captcha" name="captcha" type="number" required />
              </div>
            </div>
            <div className="form-field">
              <label className="privacy-consent">
                <input id="privacyConsent" name="privacyConsent" type="checkbox" required />
                <span>
                  J'ai lu et j'accepte la <a href="#privacy">politique de confidentialite</a>.
                </span>
              </label>
            </div>
            <div className="form-actions">
              <button type="submit" className="contact-submit">
                Envoyer la demande
              </button>
              {formStatus === 'sent' && (
                <span className="form-success">Merci ! Nous revenons vers vous tres vite.</span>
              )}
              {formStatus === 'error' && (
                <span className="form-error">{formError}</span>
              )}
            </div>
          </form>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
}
