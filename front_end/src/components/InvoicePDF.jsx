/**
 * Invoice PDF Export Component
 * Uses react-pdf and react-pdf-html for beautiful PDF generation
 */

import React from 'react';
import { Document, Page, PDFDownloadLink } from '@react-pdf/renderer';
import Html from 'react-pdf-html';
import { generateInvoiceHtml } from './invoiceHtmlGenerator';

/**
 * Invoice PDF Document Component
 */
const InvoicePDFDocument = ({ facture, client, reparation, vehicule, mechanic, companyInfo }) => {
  const [html, setHtml] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const generateHtml = async () => {
      const htmlContent = await generateInvoiceHtml(facture, client, reparation, vehicule, mechanic, companyInfo);
      setHtml(htmlContent);
      setLoading(false);
    };
    generateHtml();
  }, [facture, client, reparation, vehicule, mechanic, companyInfo]);

  if (loading) {
    return (
      <Document>
        <Page>
          <Html>{`<h1>Génération du PDF en cours...</h1>`}</Html>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`facture-${facture.id}.pdf`}>
      <Page size="A4">
        <Html>{html}</Html>
      </Page>
    </Document>
  );
};

/**
 * Download button component for invoice PDF
 */
export const InvoicePDFDownloadButton = ({ facture, client, reparation, vehicule, mechanic, companyInfo, className = '' }) => {
  return (
    <PDFDownloadLink
      document={
        <InvoicePDFDocument
          facture={facture}
          client={client}
          reparation={reparation}
          vehicule={vehicule}
          mechanic={mechanic}
          companyInfo={companyInfo}
        />
      }
      fileName={`facture-${facture.id}-${new Date().toISOString().split('T')[0]}.pdf`}
      className={className}
    >
      {({ blob, url, loading, error }) =>
        loading ? (
          <span>Génération PDF...</span>
        ) : error ? (
          <span style={{ color: 'red' }}>Erreur PDF</span>
        ) : (
          <span>Télécharger PDF</span>
        )
      }
    </PDFDownloadLink>
  );
};

/**
 * Preview component for invoice PDF
 */
export const InvoicePDFPreview = ({ facture, client, reparation, vehicule, mechanic, companyInfo }) => {
  return (
    <InvoicePDFDocument
      facture={facture}
      client={client}
      reparation={reparation}
      vehicule={vehicule}
      mechanic={mechanic}
      companyInfo={companyInfo}
    />
  );
};

export default InvoicePDFDocument;
