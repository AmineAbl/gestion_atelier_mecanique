import React, { useMemo } from 'react';
import { ArrowLeft, Shield, Scale, Globe, Lock, FileText, AlertTriangle, Wrench } from 'lucide-react';
import LandingFooter from './LandingFooter';
import './PrivacyPage.css';

export default function PrivacyPage({ onBack }) {
  const sections = useMemo(
    () => [
      {
        id: 'cadre',
        title: 'Cadre legal et gouvernance',
        icon: Scale,
        content:
          "AutoPro applique les principes du RGPD (UE) pour la licite, la transparence et la minimisation des donnees. Pour le Maroc, nous respectons la loi 09-08 et les directives de la CNDP. Pour les Etats-Unis, nous prenons en compte les exigences CCPA/CPRA. En Afrique, nous suivons la Convention de Malabo et les cadres nationaux pertinents.",
      },
      {
        id: 'donnees',
        title: 'Donnees traitees',
        icon: FileText,
        content:
          'Nous traitons les donnees necessaires a la gestion d\'atelier : identite et contacts professionnels, dossiers clients, informations vehicules, interventions techniques, facturation, journaux de securite et historiques d\'acces. Les donnees sensibles sont limitees et protegees par des controles d\'acces stricts.',
      },
      {
        id: 'finalites',
        title: 'Finalites du traitement',
        icon: Shield,
        content:
          'Execution du contrat, fonctionnement des modules (reparations, facturation, stocks), assistance et support, statistiques anonymisees, securite operationnelle et conformite reglementaire. Aucun usage publicitaire non autorise n\'est effectue.',
      },
      {
        id: 'transferts',
        title: 'Transferts et hebergement',
        icon: Globe,
        content:
          'Les donnees sont hebergees dans des environnements securises. Tout transfert hors territoire est encadre par des garanties adequates (clauses contractuelles types, mesures techniques et organisationnelles). Les sauvegardes sont chiffrees et controlees.',
      },
      {
        id: 'securite',
        title: 'Securite et incidents',
        icon: Lock,
        content:
          'Chiffrement des donnees sensibles, journalisation, segmentation des acces, surveillance et audits periodiques. En cas d\'incident, notification aux autorites competentes et aux personnes concernees selon les delais legaux applicables.',
      },
      {
        id: 'droits',
        title: 'Droits des personnes',
        icon: AlertTriangle,
        content:
          'Droits d\'acces, rectification, effacement, opposition, limitation et portabilite. Toute demande peut etre adressee a privacy@autopro.local. Les delais de reponse suivent les exigences locales (RGPD, loi 09-08, CCPA/CPRA).',
      },
    ],
    []
  );

  return (
    <div className="privacy-page">
      <div className="privacy-header">
        <div className="privacy-brand">
          <Wrench className="privacy-brand-icon" />
          <span>AutoPro</span>
        </div>
        <div className="privacy-actions">
          <button type="button" className="privacy-back" onClick={onBack}>
            <ArrowLeft className="privacy-back-icon" />
            Retour
          </button>
        </div>
      </div>

      <div className="privacy-hero">
        <h1>Politique de confidentialite</h1>
        <p>
          Engagement global pour la protection des donnees. Transparence, securite et conformite
          pour l\'Union europeenne, le Maroc, les Etats-Unis et l\'Afrique.
        </p>
      </div>

      <div className="privacy-body">
        <aside className="privacy-timeline">
          <div className="timeline-line" />
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <a key={section.id} href={`#${section.id}`} className="timeline-item">
                <span className="timeline-dot" />
                <Icon className="timeline-icon" />
                <span className="timeline-label">{String(index + 1).padStart(2, '0')}.</span>
              </a>
            );
          })}
        </aside>

        <main className="privacy-content">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <section key={section.id} id={section.id} className="privacy-section-card">
                <div className="section-header">
                  <div className="section-icon">
                    <Icon />
                  </div>
                  <h2>{section.title}</h2>
                </div>
                <p>{section.content}</p>
              </section>
            );
          })}

          <section className="privacy-section-card" id="contact">
            <div className="section-header">
              <div className="section-icon">
                <Shield />
              </div>
              <h2>Contact confidentialite</h2>
            </div>
            <p>
              Pour toute question ou reclamation, contactez privacy@autopro.local. Nous pouvons
              fournir un resume des mesures de securite et un registre des traitements sur demande.
            </p>
          </section>
        </main>
      </div>

      <LandingFooter />
    </div>
  );
}
