import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Clock, Shield, ArrowRight, BarChart3, TrendingUp, Lock, Gauge } from 'lucide-react';
import LoginModal from './LoginModal';
import { Footer } from '../common/Footer';
import { CountUp } from '../common/CountUp';
import './LandingPage.css';

export default function LandingPage({ onLoginSuccess }) {
  const [showLoginModal, setShowLoginModal] = useState(false);
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
      title: 'Gestion Intelligente',
      description: 'Orchestrez l\'intégralité de votre flux de réparation. Suivi des pièces, planification des techniciens et gestion des stocks en un tableau de bord intuitif.',
    },
    {
      icon: Gauge,
      title: 'Automatisation Complète',
      description: 'Éliminez les tâches manuelles. Factures auto-générées, rappels de paiement automatisés et planification optimisée pour gagner des heures chaque semaine.',
    },
    {
      icon: TrendingUp,
      title: 'Visibilité Totale',
      description: 'Temps réel, toujours. Suivi des réparations en direct, notifications instantanées, et rapports détaillés pour une gestion sans surprise.',
    },
    {
      icon: Lock,
      title: 'Confiance & Conformité',
      description: 'Données sécurisées avec chiffrement de grade entreprise. Conformité RGPD, sauvegardes automatiques et accès contrôlé par rôle.',
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
          <button
            onClick={() => setShowLoginModal(true)}
            className="login-button"
          >
            Se connecter
            <ArrowRight className="button-icon" />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content animate-fade-in-up">
          <h1 className="hero-title animate-blur-in">
            Votre Atelier
            <span className="gradient-text"> Maîtrisé</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up-delay-1">
            La plateforme tout-en-un pour gérer réparations, clients, factures et finances. Augmentez votre productivité, réduisez vos coûts.
          </p>

          <button
            className="cta-button animate-fade-in-up-delay-2"
            onClick={() => setShowLoginModal(true)}
          >
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

      {/* Stats Section */}
      <section className="stats-section animate-fade-in">
        <div className="stats-container">
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number">
              <CountUp end="450+" label="Ateliers satisfaits" />
            </div>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number">
              <CountUp end="125K+" label="Réparations suivi" />
            </div>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat-number">
              <CountUp end="99.9%" label="Disponibilité" />
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-fade-in">
        <div className="cta-content">
          <h2 className="cta-title">Commencez Gratuitement</h2>
          <p className="cta-subtitle">Essayez pendant 30 jours. Aucune carte requise. Annulez à tout moment.</p>
          <button
            className="cta-button large"
            onClick={() => setShowLoginModal(true)}
          >
            <span>Accès gratuit maintenant</span>
            <ArrowRight className="cta-icon" />
          </button>
        </div>
      </section>

      {/* Dashboard Link Section */}
      <section className="dashboard-link-section">
        <button
          className="dashboard-link-button"
          onClick={() => {
            // Navigate to dashboard by setting authentication state
            const dummyUser = { id: 1, name: 'Accountant', email: 'accountant@workshop.com' };
            onLoginSuccess(dummyUser);
          }}
          title="Accéder au tableau de bord"
        >
          <BarChart3 className="dashboard-icon" />
          <span>Aller au tableau de bord</span>
        </button>
      </section>

      {/* Footer */}
      <Footer />

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={onLoginSuccess}
        />
      )}
    </div>
  );
}
