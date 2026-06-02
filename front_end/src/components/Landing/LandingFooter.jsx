import React from 'react';
import { Mail, Phone } from 'lucide-react';
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
              alt="Mechanic"
              className="app-logo-img app-logo-img--footer"
            />
          </picture>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Navigation</h4>
          <ul className="footer-links">
            <li><a href="#features">Fonctionnalites</a></li>
            <li><a href="#pricing">Tarifs</a></li>
            <li><a href="#stats">Chiffres</a></li>
            <li><a href="#contact">Demande demo</a></li>
            <li><a href="#privacy">Confidentialite</a></li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Support atelier</h4>
          <ul className="footer-links">
            <li className="footer-link-row">
              <Mail className="footer-link-icon" />
              <a href="mailto:contact@autopro.local">contact@autopro.local</a>
            </li>
            <li className="footer-link-row">
              <Phone className="footer-link-icon" />
              <a href="tel:+212600000000">+212600000000</a>
            </li>
            <li className="footer-link-row">
              <Mail className="footer-link-icon" />
              <a href="mailto:responsable@atelier.local">responsable@atelier.local</a>
            </li>
          </ul>
        </div>

        <div className="footer-column">
          <h4 className="footer-heading">Equipe disponible</h4>
          <ul className="footer-links">
            <li><a href="mailto:comptable1@atelier.local">comptable1@atelier.local</a></li>
            <li><a href="mailto:comptable2@atelier.local">comptable2@atelier.local</a></li>
            <li><a href="mailto:mecanicien@atelier.local">mecanicien@atelier.local</a></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="footer-text">© 2026 AutoPro Management. Tous les droits reserves.</p>
      </div>
    </footer>
  );
}
