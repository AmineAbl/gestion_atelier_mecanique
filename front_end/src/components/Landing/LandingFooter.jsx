import React from 'react';
import { Mail, Phone, MapPin, ExternalLink, Shield, HelpCircle, FileText } from 'lucide-react';
import { LOGO_BLACK, LOGO_WHITE } from '../../constants/appLogo';
import './LandingPage.css';

export default function LandingFooter() {
  return (
    <footer className="footer-section">
      <div className="footer-content footer-columns">

        <div className="footer-brand">
          <picture className="footer-logo-picture">
            <source srcSet={LOGO_BLACK} media="(prefers-color-scheme: light)" />
            <img
              src={LOGO_WHITE}
              alt="Mecindie"
              className="app-logo-img app-logo-img--footer"
            />
          </picture>
          
          
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#features">Fonctionnalités</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#stats">Chiffres clés</a></li>
            <li><a href="#contact">Demander une démo</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Informations</h4>
          <ul className="footer-links">
            <li className="footer-link-row">
              <Shield className="footer-link-icon" />
              <a href="#privacy">Politique de confidentialité</a>
            </li>
            <li className="footer-link-row">
              <HelpCircle className="footer-link-icon" />
              <a href="#faq">FAQ</a>
            </li>
            <li className="footer-link-row">
              <FileText className="footer-link-icon" />
              <a href="#terms">Conditions d'utilisation</a>
            </li>
            <li className="footer-link-row">
              <Mail className="footer-link-icon" />
              <a href="mailto:contact@mecindie.ma">contact@mecindie.ma</a>
            </li>
            <li className="footer-link-row">
              <Phone className="footer-link-icon" />
              <a href="tel:+212600000000">+212 6 00 00 00 00</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Localisation</h4>
          <ul className="footer-links">
            <li className="footer-link-row" style={{ alignItems: 'flex-start' }}>
              <MapPin className="footer-link-icon" style={{ marginTop: '3px', color: '#f87171' }} />
              <span>
                Bd Abdelkrim Al Khattabi,<br />
                Guéliz — devant FST<br />
                <strong>Marrakech, Maroc</strong>
              </span>
            </li>
            <li className="footer-link-row">
              <ExternalLink className="footer-link-icon" style={{ color: '#60a5fa' }} />
              <a
                href="https://maps.google.com/?q=Bd+Abdelkrim+Al+Khattabi+Gueliz+Marrakech"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#60a5fa' }}
              >
                Voir sur Google Maps
              </a>
            </li>
          </ul>
        </div>

      </div>

      <div className="footer-bottom">
        <p className="footer-text">
  © 2026 <strong>Mecindie</strong>. Tous droits réservés. — Fait avec ❤️ à Marrakech
</p>
      </div>
    </footer>
  );
}