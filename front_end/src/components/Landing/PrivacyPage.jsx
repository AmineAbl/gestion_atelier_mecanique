import React, { useMemo, useState } from 'react';
import { ArrowLeft, Shield, Scale, Globe, Lock, FileText, AlertTriangle, Wrench, ChevronDown, ChevronUp, Check } from 'lucide-react';
import LandingFooter from './LandingFooter';
import { LOGO_BLACK, LOGO_WHITE } from '../../constants/appLogo';
import './PrivacyPage.css';

export default function PrivacyPage({ onBack }) {
  const [openSection, setOpenSection] = useState(null);

  const sections = useMemo(() => [
    {
      id: 'cadre',
      title: 'Cadre légal et gouvernance',
      icon: Scale,
      badge: 'Légal',
      summary: 'Conformité RGPD, loi 09-08 Maroc, CCPA/CPRA États-Unis.',
      content: [
        'MECINDIE respecte le Règlement Général sur la Protection des Données (RGPD - UE 2016/679) et applique ses principes de licéité, transparence et minimisation des données.',
        'Pour le Maroc, nous nous conformons à la loi 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel, sous la supervision de la CNDP.',
        'Pour les utilisateurs américains, nous prenons en compte les exigences CCPA/CPRA (Californie). Nous suivons également la Convention de Malabo et les cadres nationaux africains pertinents.',
        'Un délégué à la protection des données (DPO) peut être contacté à privacy@mecindie.ma.',
      ],
    },
    {
      id: 'donnees',
      title: 'Données collectées',
      icon: FileText,
      badge: 'Données',
      summary: 'Identité, contacts professionnels, dossiers clients, véhicules, facturation.',
      content: [
        'Données d\'identification : nom, prénom, email professionnel, numéro de téléphone, nom de l\'atelier.',
        'Données opérationnelles : dossiers clients, informations véhicules (immatriculation, modèle, kilométrage), historique des interventions et réparations.',
        'Données financières : factures, montants, statuts de paiement — utilisées exclusivement pour la gestion comptable de votre atelier.',
        'Données techniques : journaux de connexion, adresses IP, actions utilisateur — collectées pour la sécurité et la détection de fraudes uniquement.',
        'Nous ne collectons jamais de données sensibles (santé, origine ethnique, opinions politiques) et n\'effectuons aucun profilage à des fins publicitaires.',
      ],
    },
    {
      id: 'finalites',
      title: 'Finalités du traitement',
      icon: Shield,
      badge: 'Usage',
      summary: 'Exécution du contrat, support, statistiques anonymisées, sécurité.',
      content: [
        'Exécution du contrat de service : fonctionnement des modules réparations, facturation, gestion des stocks et des clients.',
        'Support et assistance technique : diagnostic de pannes, résolution d\'incidents, formation des utilisateurs.',
        'Amélioration du service : statistiques anonymisées et agrégées sur l\'utilisation de la plateforme — jamais de données nominatives.',
        'Sécurité opérationnelle : détection d\'accès non autorisés, prévention des fraudes, journalisation des actions sensibles.',
        'Conformité réglementaire : conservation des données fiscales et comptables selon les durées légales applicables.',
      ],
    },
    {
      id: 'transferts',
      title: 'Hébergement et transferts',
      icon: Globe,
      badge: 'Infrastructure',
      summary: 'Hébergement sécurisé, transferts encadrés, sauvegardes chiffrées.',
      content: [
        'Les données sont hébergées sur des serveurs sécurisés situés dans des zones géographiques conformes aux réglementations applicables.',
        'Tout transfert de données hors du territoire national est encadré par des garanties adéquates : clauses contractuelles types (CCT) approuvées par la Commission Européenne.',
        'Les sauvegardes sont chiffrées (AES-256) et stockées dans des environnements isolés, avec des tests de restauration effectués régulièrement.',
        'Nos sous-traitants (hébergeurs, prestataires techniques) sont contractuellement tenus de respecter les mêmes exigences de confidentialité.',
      ],
    },
    {
      id: 'securite',
      title: 'Sécurité et incidents',
      icon: Lock,
      badge: 'Sécurité',
      summary: 'Chiffrement, contrôles d\'accès, audit, notification sous 72h.',
      content: [
        'Chiffrement des données sensibles en transit (TLS 1.3) et au repos (AES-256).',
        'Contrôle d\'accès basé sur les rôles (RBAC) : chaque utilisateur n\'accède qu\'aux données nécessaires à ses fonctions (mécanicien, comptable, gestionnaire).',
        'Journalisation complète des accès et des modifications sensibles, avec alertes en temps réel.',
        'En cas de violation de données, notification aux autorités compétentes (CNIL, CNDP) dans les 72 heures, et aux personnes concernées sans délai injustifié.',
        'Audits de sécurité périodiques et tests de pénétration réalisés par des prestataires indépendants.',
      ],
    },
    {
      id: 'droits',
      title: 'Vos droits',
      icon: AlertTriangle,
      badge: 'Droits',
      summary: 'Accès, rectification, effacement, portabilité, opposition.',
      content: [
        'Droit d\'accès : vous pouvez demander une copie de toutes les données vous concernant détenues par MECINDIE.',
        'Droit de rectification : toute donnée inexacte ou incomplète peut être corrigée sur simple demande.',
        'Droit à l\'effacement (droit à l\'oubli) : vous pouvez demander la suppression de vos données, sauf obligation légale de conservation.',
        'Droit à la portabilité : vos données peuvent vous être transmises dans un format structuré et lisible par machine (JSON, CSV).',
        'Droit d\'opposition et de limitation : vous pouvez vous opposer à certains traitements ou en demander la limitation.',
        'Pour exercer vos droits, contactez privacy@mecindie.ma. Délai de réponse : 30 jours maximum (RGPD / loi 09-08).',
      ],
    },
    {
      id: 'retention',
      title: 'Durées de conservation',
      icon: FileText,
      badge: 'Rétention',
      summary: 'Données actives, archives légales, suppression automatique.',
      content: [
        'Données de compte actif : conservées pendant toute la durée du contrat de service.',
        'Données de facturation et comptables : 10 ans conformément aux obligations fiscales marocaines et européennes.',
        'Journaux de sécurité : 12 mois glissants.',
        'Données de demandes de démo non converties : supprimées après 6 mois.',
        'Après résiliation du contrat : suppression complète des données opérationnelles sous 90 jours, sauf obligation légale contraire.',
      ],
    },
  ], []);

  const toggleSection = (id) => setOpenSection(openSection === id ? null : id);

  return (
    <div className="privacy-page">

      {/* Header */}
      <div className="privacy-header">
        <div className="privacy-brand">
          <img src="/logo_white.png" alt="Mecindie" style={{ height: '32px', width: 'auto' }} />
        </div>
        <button type="button" className="privacy-back" onClick={onBack}>
          <ArrowLeft className="privacy-back-icon" />
          Retour
        </button>
      </div>

      {/* Hero */}
      <div className="privacy-hero">
        <div className="privacy-hero-badge">
          <Shield className="privacy-hero-badge-icon" />
          Protection des données
        </div>
        <h1>Politique de confidentialité</h1>
        <p>
          Engagement total pour la protection de vos données. Transparence, sécurité et conformité
          au RGPD, à la loi marocaine 09-08, au CCPA et aux cadres africains applicables.
        </p>
        <div className="privacy-hero-meta">
          <span>Dernière mise à jour : Juin 2026</span>
          <span className="privacy-hero-dot" />
          <span>Version 1.0</span>
          <span className="privacy-hero-dot" />
          <span>Langue : Français</span>
        </div>
      </div>

      {/* Trust badges */}
      <div className="privacy-trust-row">
        {['RGPD Conforme', 'Loi 09-08 Maroc', 'CCPA/CPRA', 'Chiffrement AES-256'].map((label) => (
          <div key={label} className="privacy-trust-badge">
            <Check className="privacy-trust-icon" />
            {label}
          </div>
        ))}
      </div>

      {/* Accordion sections */}
      <div className="privacy-body">
        <div className="privacy-accordion">
          {sections.map((section, index) => {
            const Icon = section.icon;
            const isOpen = openSection === section.id;
            return (
              <div key={section.id} id={section.id} className={`privacy-accordion-item ${isOpen ? 'open' : ''}`}>
                <button
                  type="button"
                  className="privacy-accordion-trigger"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="privacy-accordion-left">
                    <span className="privacy-accordion-number">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div className="privacy-accordion-icon-wrap">
                      <Icon className="privacy-accordion-icon" />
                    </div>
                    <div className="privacy-accordion-titles">
                      <span className="privacy-accordion-badge">{section.badge}</span>
                      <span className="privacy-accordion-title">{section.title}</span>
                      {!isOpen && (
                        <span className="privacy-accordion-summary">{section.summary}</span>
                      )}
                    </div>
                  </div>
                  {isOpen
                    ? <ChevronUp className="privacy-accordion-chevron" />
                    : <ChevronDown className="privacy-accordion-chevron" />
                  }
                </button>
                {isOpen && (
                  <div className="privacy-accordion-body">
                    <ul className="privacy-content-list">
                      {section.content.map((item, i) => (
                        <li key={i} className="privacy-content-item">
                          <span className="privacy-content-dot" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Contact box */}
        <div className="privacy-contact-box">
          <div className="privacy-contact-icon-wrap">
            <Shield />
          </div>
          <div>
            <h3>Questions sur vos données ?</h3>
            <p>Notre délégué à la protection des données répond sous 30 jours.</p>
            <a href="mailto:privacy@mecindie.ma" className="privacy-contact-link">
              privacy@mecindie.ma
            </a>
          </div>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}