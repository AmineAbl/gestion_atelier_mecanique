import React, { useState, useEffect } from 'react';
import { Wrench, Zap, Clock, Shield, ArrowRight } from 'lucide-react';
import './LandingPage.css';

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
      title: 'Gestion Complète',
      description: 'Gérez vos réparations, clients et factures en un seul endroit.',
    },
    {
      icon: Zap,
      title: 'Rapide & Efficace',
      description: 'Accélérez vos opérations avec une interface intuitive et performante.',
    },
    {
      icon: Clock,
      title: 'Suivi Temps Réel',
      description: 'Suivez vos réparations en temps réel avec des mises à jour instantanées.',
    },
    {
      icon: Shield,
      title: 'Sécurisé',
      description: 'Vos données sont protégées avec les meilleurs protocoles de sécurité.',
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
          <h1 className="hero-title animate-blur-in">
            Gérez Votre Atelier
            <span className="gradient-text"> Comme un Pro</span>
          </h1>

          <p className="hero-subtitle animate-fade-in-up-delay-1">
            Une solution complète pour gérer vos clients, réparations et factures
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

      {/* Stats Section */}
      <section className="stats-section animate-fade-in">
        <div className="stats-container">
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="stat-number">100+</div>
            <p className="stat-label">Ateliers actifs</p>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="stat-number">5K+</div>
            <p className="stat-label">Réparations gérées</p>
          </div>
          <div className="stat-item animate-fade-in" style={{ animationDelay: '0.4s' }}>
            <div className="stat-number">99.9%</div>
            <p className="stat-label">Uptime garanti</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section animate-fade-in">
        <div className="cta-content">
          <h2 className="cta-title">Prêt à démarrer ?</h2>
          <p className="cta-subtitle">Connectez-vous et gérez votre atelier dès aujourd'hui</p>
          <button type="button" className="cta-button large" onClick={onGoToLogin}>
            <span>Se connecter maintenant</span>
            <ArrowRight className="cta-icon" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer-section animate-fade-in">
        <div className="footer-content">
          <div className="footer-brand">
            <Wrench className="footer-icon" />
            <span>AutoPro Management</span>
          </div>
          <p className="footer-text">
            © 2026 AutoPro. Tous les droits réservés.
          </p>
          
          {/* Temporary Buttons for UI Testing */}
          <div style={{ marginTop: '40px', paddingTop: '30px', borderTop: '2px solid rgba(255,255,255,0.1)', display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button 
              onClick={() => console.log('Landing Temp Button 1')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Btn Temp 1
            </button>
            <button 
              onClick={() => console.log('Landing Temp Button 2')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Btn Temp 2
            </button>
            <button 
              onClick={() => console.log('Landing Temp Button 3')}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                border: '2px solid rgba(255,255,255,0.3)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.1)';
                e.target.style.borderColor = 'rgba(255,255,255,0.5)';
                e.target.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(255,255,255,0.05)';
                e.target.style.borderColor = 'rgba(255,255,255,0.3)';
                e.target.style.transform = 'translateY(0)';
              }}
            >
              Btn Temp 3
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
