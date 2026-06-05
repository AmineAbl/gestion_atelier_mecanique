/**
 * Professional PDF Generation Utilities for Financial Reports
 * Uses jsPDF for financial reports
 * Uses browser popup + print for individual invoices (full CSS support)
 */

import { jsPDF } from 'jspdf';
import { generateInvoiceHtml } from './invoiceHtmlGenerator';
import { findVehicleCsvMatch } from './vehicleCsvLookup';
import { formatCurrency, formatDate } from './helpers';

/**
 * Generate a professional financial report PDF
 */
export const generateFinancialReportPDF = (
  metrics,
  monthlyData,
  invoiceStatusData,
  topClients,
  factures,
  clients,
  reparations
) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 15;

  // Colors
  const primaryColor = [51, 65, 85]; // slate-700
  const secondaryColor = [59, 130, 246]; // blue-500
  const accentColor = [16, 185, 129]; // green-500
  const lightGray = [242, 242, 242]; // gray-100

  // Helper function to add a new page
  const addNewPage = () => {
    doc.addPage();
    yPosition = 15;
  };

  // Helper function to check if we need a new page
  const checkPageBreak = (height = 10) => {
    if (yPosition + height > pageHeight - 20) {
      addNewPage();
    }
  };

  // Title
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont('Helvetica', 'bold');
  doc.text('Rapport Financier', pageWidth / 2, 15, { align: 'center' });

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 24, {
    align: 'center',
  });

  yPosition = 40;

  // Key Metrics Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('Métriques Clés', 15, yPosition);
  yPosition += 12;

  // Metrics boxes
  const metricsData = [
    { label: 'Revenu Total', value: formatCurrency(metrics.totalRevenue), color: accentColor },
    { label: 'Coûts Totaux', value: formatCurrency(metrics.totalCosts), color: [239, 68, 68] },
    { label: 'Bénéfice Net', value: formatCurrency(metrics.totalProfit), color: secondaryColor },
    { label: 'Marge Bénéficiaire', value: `${metrics.profitMargin}%`, color: [168, 85, 247] },
  ];

  const metricsPerRow = 2;
  const metricWidth = (pageWidth - 30) / metricsPerRow;

  metricsData.forEach((metric, index) => {
    const row = Math.floor(index / metricsPerRow);
    const col = index % metricsPerRow;
    const x = 15 + col * metricWidth;
    const y = yPosition + row * 25;

    // Metric box background
    doc.setFillColor(...metric.color);
    doc.setTextColor(255, 255, 255);
    doc.roundedRect(x, y, metricWidth - 5, 20, 3, 3, 'F');

    // Label and value
    doc.setFontSize(9);
    doc.text(metric.label, x + 5, y + 7);
    doc.setFontSize(12);
    doc.setFont('Helvetica', 'bold');
    doc.text(metric.value, x + 5, y + 15);
  });

  yPosition += 60;
  checkPageBreak(15);

  // Invoice Status Section
  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('Statut des Factures', 15, yPosition);
  yPosition += 10;

  doc.setFillColor(...lightGray);
  doc.rect(15, yPosition, pageWidth - 30, 25, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'bold');

  const invoiceStatuses = [
    { name: 'Payées', count: factures.filter((f) => f.statut === 'paid').length },
    { name: 'En attente', count: factures.filter((f) => f.statut === 'pending').length },
    { name: 'Annulées', count: factures.filter((f) => f.statut === 'cancelled').length },
  ];

  const statusWidth = (pageWidth - 30) / 3;
  invoiceStatuses.forEach((status, index) => {
    const xPos = 15 + index * statusWidth + 5;
    doc.text(`${status.name}: ${status.count}`, xPos, yPosition + 10);
  });

  yPosition += 35;
  checkPageBreak(15);

  // Top Clients Section
  if (topClients.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Top 5 Clients', 15, yPosition);
    yPosition += 10;

    // Table header
    doc.setFillColor(...primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('Helvetica', 'bold');

    const tableWidth = pageWidth - 30;
    const col1Width = tableWidth * 0.6;
    const col2Width = tableWidth * 0.4;

    doc.rect(15, yPosition, col1Width, 7, 'F');
    doc.rect(15 + col1Width, yPosition, col2Width, 7, 'F');

    doc.text('Client', 18, yPosition + 5);
    doc.text('Montant Dépensé', 15 + col1Width + 5, yPosition + 5);

    yPosition += 8;

    // Table rows
    doc.setTextColor(...primaryColor);
    doc.setFont('Helvetica', 'normal');

    topClients.forEach((client, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(242, 242, 242);
        doc.rect(15, yPosition, tableWidth, 6, 'F');
      }

      doc.setFontSize(8);
      doc.text(client.name, 18, yPosition + 4);
      doc.text(formatCurrency(client.amount), 15 + col1Width + 5, yPosition + 4);
      yPosition += 6;
    });

    yPosition += 10;
    checkPageBreak(15);
  }

  // Monthly Statistics Section
  if (monthlyData && monthlyData.length > 0) {
    doc.setTextColor(...primaryColor);
    doc.setFontSize(14);
    doc.setFont('Helvetica', 'bold');
    doc.text('Statistiques Mensuelles', 15, yPosition);
    yPosition += 10;

    // Recent months data
    const recentMonths = monthlyData.slice(-6); // Last 6 months

    // Table header
    doc.setFillColor(...primaryColor);
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(8);
    doc.setFont('Helvetica', 'bold');

    const tableWidth = pageWidth - 30;
    const monthCol = 0.25;
    const revCol = 0.25;
    const costCol = 0.25;
    const profitCol = 0.25;

    doc.rect(15, yPosition, tableWidth, 6, 'F');
    doc.text('Mois', 17, yPosition + 4);
    doc.text('Revenu', 15 + tableWidth * monthCol + 2, yPosition + 4);
    doc.text('Coûts', 15 + tableWidth * (monthCol + revCol) + 2, yPosition + 4);
    doc.text('Profit', 15 + tableWidth * (monthCol + revCol + costCol) + 2, yPosition + 4);

    yPosition += 7;

    // Table rows
    doc.setTextColor(...primaryColor);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);

    recentMonths.forEach((month, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(242, 242, 242);
        doc.rect(15, yPosition, tableWidth, 5, 'F');
      }

      doc.text(month.month.substring(0, 10), 17, yPosition + 3);
      doc.text(formatCurrency(month.revenue), 15 + tableWidth * monthCol + 2, yPosition + 3);
      doc.text(formatCurrency(month.costs), 15 + tableWidth * (monthCol + revCol) + 2, yPosition + 3);
      doc.text(formatCurrency(month.profit), 15 + tableWidth * (monthCol + revCol + costCol) + 2, yPosition + 3);
      yPosition += 5;
    });

    yPosition += 10;
    checkPageBreak(15);
  }

  // Repair Statistics Section
  const repairStats = {
    completed: reparations.filter((r) => r.statut === 'completed').length,
    'in-progress': reparations.filter((r) => r.statut === 'in-progress').length,
    pending: reparations.filter((r) => r.statut === 'pending').length,
  };

  doc.setTextColor(...primaryColor);
  doc.setFontSize(14);
  doc.setFont('Helvetica', 'bold');
  doc.text('Statistiques Réparations', 15, yPosition);
  yPosition += 10;

  doc.setFillColor(...lightGray);
  doc.rect(15, yPosition, pageWidth - 30, 20, 'F');

  doc.setTextColor(...primaryColor);
  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');

  const repairWidth = (pageWidth - 30) / 3;
  [
    { label: 'Terminées', count: repairStats.completed },
    { label: 'En Cours', count: repairStats['in-progress'] },
    { label: 'En Attente', count: repairStats.pending },
  ].forEach((stat, index) => {
    const xPos = 15 + index * repairWidth + 5;
    doc.text(`${stat.label}:`, xPos, yPosition + 8);
    doc.setFont('Helvetica', 'bold');
    doc.text(String(stat.count), xPos, yPosition + 14);
    doc.setFont('Helvetica', 'normal');
  });

  // Footer
  yPosition = pageHeight - 15;
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text('Rapport généré automatiquement', pageWidth / 2, yPosition, { align: 'center' });
  doc.text(`Page 1`, pageWidth / 2, yPosition + 5, { align: 'center' });

  // Save PDF
  doc.save(`rapport-financier-${new Date().toISOString().split('T')[0]}.pdf`);
};

/**
 * Generate a professional invoice PDF by opening a styled print window.
 * Uses the browser's native print-to-PDF capability for full CSS support.
 * @param {string} theme - 'blue' | 'green' | 'red'
 */
export const generateInvoicePDF = async (facture, client, reparation, vehicule, mechanic, companyInfo = {}, theme = 'blue') => {
  try {
    let vehicleCsvInfo = null;
    try {
      vehicleCsvInfo = await findVehicleCsvMatch(vehicule);
    } catch (csvError) {
      console.warn('CSV vehicule indisponible:', csvError);
    }

    const htmlContent = generateInvoiceHtml(
      facture,
      client,
      reparation,
      vehicule,
      mechanic,
      companyInfo,
      theme,
      vehicleCsvInfo
    );

    const printWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes');
    if (!printWindow) {
      throw new Error('Le navigateur a bloqué la fenêtre popup. Veuillez autoriser les popups pour ce site.');
    }

    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  } catch (error) {
    console.error('Erreur génération facture PDF:', error);
    throw error;
  }
};

export const generateMechanicPersonalReportPDF = (user, reparations = []) => {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let y = 18;

  const primaryColor = [51, 65, 85];
  const softGray = [241, 245, 249];

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Rapport personnel mécanicien', pageWidth / 2, 16, { align: 'center' });

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(`Généré le : ${new Date().toLocaleDateString('fr-FR')}`, pageWidth / 2, 24, { align: 'center' });

  y += 14;
  doc.setTextColor(...primaryColor);
  doc.setFontSize(12);
  doc.setFont('Helvetica', 'bold');
  doc.text('Informations personnelles', 15, y);
  y += 8;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  const fullName = user?.name || `${user?.prenom || ''} ${user?.nom || ''}`.trim() || '—';
  const email = user?.email || '—';
  const cin = user?.cin || '—';
  const role = 'Mécanicien';

  const fields = [
    ['Nom', fullName],
    ['Email', email],
    ['CIN', cin],
    ['Rôle', role],
  ];

  fields.forEach(([label, value]) => {
    doc.setTextColor(...primaryColor);
    doc.setFont('Helvetica', 'bold');
    doc.text(`${label}:`, 15, y);
    doc.setTextColor(30, 41, 59);
    doc.setFont('Helvetica', 'normal');
    doc.text(value, 52, y);
    y += 7;
  });

  y += 6;
  doc.setFont('Helvetica', 'bold');
  doc.text('Résumé des interventions', 15, y);
  y += 8;

  const stats = {
    total: reparations.length,
    completed: reparations.filter((r) => r.statut === 'completed').length,
    inProgress: reparations.filter((r) => r.statut === 'in-progress').length,
    pending: reparations.filter((r) => r.statut === 'pending').length,
  };

  const summaryEntries = [
    ['Total', stats.total],
    ['Terminées', stats.completed],
    ['En cours', stats.inProgress],
    ['En attente', stats.pending],
  ];

  const summaryX = 15;
  const summaryWidth = (pageWidth - 30) / 2;
  doc.setFontSize(10);
  summaryEntries.forEach((entry, index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const boxX = summaryX + col * summaryWidth;
    const boxY = y + row * 18;
    doc.setFillColor(...softGray);
    doc.roundedRect(boxX, boxY, summaryWidth - 8, 15, 4, 4, 'F');
    doc.setTextColor(...primaryColor);
    doc.setFont('Helvetica', 'bold');
    doc.text(String(entry[1]), boxX + 4, boxY + 6);
    doc.setFont('Helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(entry[0], boxX + 4, boxY + 12);
  });

  y += 40;
  if (y + 70 > pageHeight - 20) {
    doc.addPage();
    y = 20;
  }

  doc.setFont('Helvetica', 'bold');
  doc.text('Interventions récentes', 15, y);
  y += 8;
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(9);

  const recent = [...reparations]
    .sort((a, b) => new Date(b.date_debut || b.created_at || 0) - new Date(a.date_debut || a.created_at || 0))
    .slice(0, 6);

  if (recent.length === 0) {
    doc.text('Aucune intervention enregistrée.', 15, y);
  } else {
    recent.forEach((rep) => {
      if (y + 30 > pageHeight - 20) {
        doc.addPage();
        y = 20;
      }
      const vehicle = rep.vehicule ? `${rep.vehicule.marque || 'Véhicule'} ${rep.vehicule.modele || ''}`.trim() : 'Véhicule inconnu';
      const immat = rep.vehicule ? (rep.vehicule.immat || rep.vehicule.immatriculation || '—') : '—';
      const date = rep.date_debut ? new Date(rep.date_debut).toLocaleDateString('fr-FR') : 'Date indisponible';
      const status = rep.statut || '—';
      const cost = rep.cout != null ? `${rep.cout} MAD` : '—';

      doc.setFillColor(255, 255, 255);
      doc.roundedRect(15, y - 6, pageWidth - 30, 22, 4, 4, 'F');
      doc.setTextColor(...primaryColor);
      doc.setFont('Helvetica', 'bold');
      doc.text(vehicle, 18, y);
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.text(`Immatriculation: ${immat} • Statut: ${status}`, 18, y + 5);
      doc.text(`Début: ${date} • Coût: ${cost}`, 18, y + 10);
      const description = rep.description ? rep.description.slice(0, 80) : 'Pas de description';
      doc.setTextColor(71, 85, 105);
      doc.text(description, 18, y + 15);
      y += 30;
    });
  }

  doc.save(`rapport_personnel_${(user?.email || 'mecanicien').replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
};

