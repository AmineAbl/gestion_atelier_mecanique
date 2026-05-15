import React, { useState, useEffect } from 'react';
import { Wrench, ArrowRight, Gauge, TrendingUp, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Footer } from '../common/Footer';
import { PerspectiveMarquee } from '../common/PerspectiveMarquee';
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

export default function LandingPage({ onGoToLogin }) {
  const [isScrolled, setIsScrolled] = useState(false);

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
          <motion.h1
            className="hero-title animate-blur-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Votre Atelier
            </motion.span>
            <motion.span
              className="gradient-text"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {' '}Maîtrise
            </motion.span>
          </motion.h1>

          <p className="hero-subtitle animate-fade-in-up-delay-1">
            La plateforme tout-en-un pour gérer réparations automobile, clients, factures et finances. Optimisez votre flux d'atelier, augmentez votre rentabilité.
          </p>

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
      <section className="features-section">
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
      <section className="stats-section animate-fade-in">
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
      <section className="cta-section animate-fade-in">
        <div className="cta-content">
          <h2 className="cta-title">Prêt à démarrer ?</h2>
          <p className="cta-subtitle">Connectez-vous et gérez votre atelier dès aujourd'hui</p>
          <button
            className="cta-button large"
            onClick={onGoToLogin}
          >
            <span>Se connecter maintenant</span>
            <ArrowRight className="cta-icon" />
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
}
