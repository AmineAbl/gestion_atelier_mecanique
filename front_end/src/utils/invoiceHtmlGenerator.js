/**
 * Generate a complete, print-ready HTML invoice page
 * Supports all CSS features since it renders in a real browser window
 * @param {string} theme - 'blue' | 'green' | 'red'
 */

export const generateInvoiceHtml = (facture, client, reparation, vehicule, mechanic, companyInfo = {}, theme = 'blue', vehicleCsvInfo = null) => {
  // ── Theme palettes ──────────────────────────────────────────────────────────
  const palettes = {
    blue: {
      headerGrad:    'linear-gradient(135deg, #0f172a 0%, #1e3a5f 100%)',
      accent:        '#38bdf8',
      accentDark:    '#0ea5e9',
      totalBg:       '#0f172a',
      totalText:     '#38bdf8',
      btnBg:         'linear-gradient(135deg, #0f172a, #1e3a5f)',
      chipBg:        '#eff6ff',
      chipBorder:    '#bfdbfe',
      chipText:      '#1d4ed8',
      sectionBorder: '#bfdbfe',
    },
    green: {
      headerGrad:    'linear-gradient(135deg, #052e16 0%, #14532d 100%)',
      accent:        '#4ade80',
      accentDark:    '#22c55e',
      totalBg:       '#052e16',
      totalText:     '#4ade80',
      btnBg:         'linear-gradient(135deg, #052e16, #14532d)',
      chipBg:        '#f0fdf4',
      chipBorder:    '#bbf7d0',
      chipText:      '#15803d',
      sectionBorder: '#bbf7d0',
    },
    red: {
      headerGrad:    'linear-gradient(135deg, #450a0a 0%, #7f1d1d 100%)',
      accent:        '#f87171',
      accentDark:    '#ef4444',
      totalBg:       '#450a0a',
      totalText:     '#f87171',
      btnBg:         'linear-gradient(135deg, #450a0a, #7f1d1d)',
      chipBg:        '#fff1f2',
      chipBorder:    '#fecdd3',
      chipText:      '#be123c',
      sectionBorder: '#fecdd3',
    },
  };
  const pal = palettes[theme] || palettes.blue;

  const formatPrice = (amount) => {
    const num = Number(amount || 0).toFixed(2);
    const [intPart, decPart] = num.split('.');
    return `${intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u202f')},${decPart}`;
  };

  const sousTotal = Number(facture.cout || 0);
  const rawTaxes = Array.isArray(facture.taxes) && facture.taxes.length
    ? facture.taxes
    : [];
  const taxes = rawTaxes.map((tax, index) => ({
    label: String(tax.label || `Taxe ${index + 1}`),
    rate: Number(tax.rate || 0),
    note: tax.note ? String(tax.note) : '',
  }));
  const taxTotal = taxes.reduce(
    (sum, tax) => sum + (sousTotal * tax.rate) / 100,
    0
  );
  const fallbackTaxTotal = Number(facture.tax_total || 0);
  const effectiveTaxTotal = taxes.length ? taxTotal : fallbackTaxTotal || sousTotal * 0.2;
  const totalTTC = taxes.length
    ? sousTotal + taxTotal
    : Number(facture.prix_total || sousTotal + effectiveTaxTotal);
  const invoiceDate = facture.date_validation || new Date().toISOString().split('T')[0];

  const statutLabel = {
    paid: 'Payée',
    pending: 'En attente',
    cancelled: 'Annulée',
  }[facture.statut] || facture.statut || 'N/A';

  const reparationStatutLabel = {
    completed: 'Terminée',
    'in-progress': 'En cours',
    pending: 'En attente',
  }[reparation?.statut] || reparation?.statut || 'N/A';

  const statutColor = {
    paid: '#16a34a',
    pending: '#d97706',
    cancelled: '#dc2626',
  }[facture.statut] || '#64748b';

  const reparationStatutColor = {
    completed: '#16a34a',
    'in-progress': '#2563eb',
    pending: '#d97706',
  }[reparation?.statut] || '#64748b';

  const mechanicName = [mechanic?.prenom, mechanic?.nom].filter(Boolean).join(' ') || 'Non assigné';
  const mechanicEmail = mechanic?.email || '';
  const mechanicPhone = mechanic?.telephone || mechanic?.phone || '';

  const clientName = `${client?.prenom || ''} ${client?.nom || ''}`.trim() || 'Client inconnu';
  const immat = vehicule?.immat || vehicule?.immatriculation || 'N/A';
  const nPieces = facture.total_piece ?? 0;

  const csvDetails = vehicleCsvInfo
    ? [
        { label: 'Carburant', value: vehicleCsvInfo.fuelType1 || vehicleCsvInfo.fuelType },
        { label: 'Transmission', value: vehicleCsvInfo.transmission },
        { label: 'Motricité', value: vehicleCsvInfo.drive },
        { label: 'Cylindres', value: vehicleCsvInfo.cylinders },
        { label: 'Cylindrée (L)', value: vehicleCsvInfo.engineDisplacement },
        { label: 'Catégorie', value: vehicleCsvInfo.vehicleClass },
        { label: 'Conso ville (MPG)', value: vehicleCsvInfo.cityMpg },
        { label: 'Conso autoroute (MPG)', value: vehicleCsvInfo.highwayMpg },
        { label: 'Conso combinée (MPG)', value: vehicleCsvInfo.combinedMpg },
        { label: 'Coût carburant annuel', value: vehicleCsvInfo.annualFuelCost },
        { label: 'Score GES', value: vehicleCsvInfo.ghgScore },
        { label: 'Score économie', value: vehicleCsvInfo.epaScore },
      ].filter((row) => row.value != null && String(row.value).trim() !== '')
    : [];

  const csvDetailsHtml = csvDetails.length
    ? `
        <div class="info-card accent compact-card" style="margin-bottom:10px;">
          <div class="info-card-title">📊 Informations générales sur le véhicule</div>
          <div class="compact-grid">
            ${csvDetails
              .map((row) => `<div class="compact-row"><span class="compact-label">${row.label}</span><span class="compact-value">${row.value}</span></div>`)
              .join('')}
          </div>
          <p class="compact-note">Ces informations sont indicatives et peuvent varier selon l'équipement réel du véhicule. Les autres données de cette facture sont vérifiées.</p>
        </div>
      `
    : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Facture #${facture.id} – ${clientName}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif;
      background: #f1f5f9;
      color: #1e293b;
      font-size: 14px;
      line-height: 1.6;
    }

    /* ── Print ─────────────────────────────────────── */
    @media print {
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { background: #fff !important; margin: 0 !important; padding: 0 !important; font-size: 10px !important; }
      .no-print { display: none !important; }
      .page {
        display: block !important;
        padding: 0 !important;
        min-height: unset !important;
        background: transparent !important;
      }
      .header,
      .status-banner,
      .footer {
        break-inside: avoid !important;
        page-break-inside: avoid !important;
      }
      .invoice-wrapper {
        box-shadow: none !important;
        border-radius: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
      }
      .header { padding: 14px 18px !important; }
      .status-banner { padding: 5px 18px !important; }
      .body { padding: 12px 18px !important; }
      .grid-2 { gap: 8px !important; margin-bottom: 8px !important; }
      .info-card { padding: 8px 10px !important; }
      .info-name { font-size: 13px !important; }
      .info-row { font-size: 11px !important; }
      .section-title { margin-top: 2px !important; margin-bottom: 6px !important; }
      .items-table thead th { padding: 8px 10px !important; font-size: 10px !important; }
      .items-table tbody td { padding: 8px 10px !important; font-size: 11px !important; }
      .totals-box { width: 260px !important; }
      .total-row { padding: 8px 12px !important; font-size: 12px !important; }
      .total-row:last-child { padding: 10px 12px !important; font-size: 13px !important; }
      .compact-grid { gap: 4px 10px !important; }
      .compact-row { font-size: 10px !important; }
      .footer { padding: 6px 18px !important; }
      .invoice-number { font-size: 24px !important; }
      .company-name { font-size: 18px !important; }
      @page { size: A4 portrait; margin: 6mm 8mm; }
    }

    /* ── Layout ─────────────────────────────────────── */
    .page {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px 16px 48px;
    }

    .invoice-wrapper {
      background: #ffffff;
      width: 100%;
      max-width: 800px;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.12);
      overflow: hidden;
    }

    /* ── Header ─────────────────────────────────────── */
    .header {
      background: ${pal.headerGrad};
      color: #ffffff;
      padding: 32px 36px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .company-name {
      font-size: 22px;
      font-weight: 800;
      letter-spacing: -0.5px;
      margin-bottom: 6px;
    }

    .company-meta {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.7;
    }

    .invoice-id-block {
      text-align: right;
    }

    .invoice-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 2px;
      color: #94a3b8;
      margin-bottom: 4px;
    }

    .invoice-number {
      font-size: 32px;
      font-weight: 800;
      color: ${pal.accent};
    }

    .invoice-date {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 4px;
    }

    /* ── Status banner ────────────────────────────── */
    .status-banner {
      background: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      padding: 7px 28px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .status-chip {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 14px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
      background: ${statutColor}18;
      color: ${statutColor};
      border: 1px solid ${statutColor}40;
    }

    .status-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: ${statutColor};
    }

    .status-label-text {
      font-size: 12px;
      color: #64748b;
    }

    /* ── Body ─────────────────────────────────────── */
    .body {
      padding: 20px 28px;
    }

    /* ── 2-col grid ───────────────────────────────────── */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 12px;
    }

    .info-card {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      background: #f8fafc;
    }

    .info-card.accent {
      background: #fffbeb;
      border-color: #fde68a;
    }

    .info-card.mechanic {
      background: ${pal.chipBg};
      border-color: ${pal.chipBorder};
    }

    .info-card-title {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #64748b;
      margin-bottom: 6px;
    }

    .info-card.accent .info-card-title { color: #92400e; }
    .info-card.mechanic .info-card-title { color: ${pal.chipText}; }

    .info-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 4px;
    }

    .info-row {
      font-size: 12px;
      color: #475569;
      margin-top: 2px;
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .compact-card {
      padding: 10px 12px;
    }

    .compact-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 6px 12px;
      margin-top: 6px;
    }

    .compact-row {
      display: flex;
      justify-content: space-between;
      gap: 8px;
      font-size: 11px;
      color: #334155;
    }

    .compact-label {
      color: #64748b;
      font-weight: 600;
    }

    .compact-value {
      color: #0f172a;
      font-weight: 600;
      text-align: right;
      white-space: nowrap;
    }

    .compact-note {
      margin-top: 8px;
      font-size: 10px;
      color: #94a3b8;
      line-height: 1.4;
    }

    .info-row strong {
      color: #334155;
      font-weight: 600;
    }

    /* ── Repair status chip ─────────────────────────── */
    .rep-status-chip {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 2px 10px;
      border-radius: 999px;
      font-size: 11px;
      font-weight: 600;
      background: ${reparationStatutColor}18;
      color: ${reparationStatutColor};
      border: 1px solid ${reparationStatutColor}40;
    }

    /* ── Divider ────────────────────────────────────── */
    .section-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1.2px;
      color: #94a3b8;
      margin-bottom: 10px;
      margin-top: 4px;
    }

    /* ── Items table ────────────────────────────────── */
    .items-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
      border-radius: 10px;
      overflow: hidden;
      border: 1px solid #e2e8f0;
    }

    .items-table thead tr {
      background: ${pal.totalBg};
      color: #ffffff;
    }

    .items-table thead th {
      padding: 12px 16px;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      text-align: left;
    }

    .items-table thead th:last-child { text-align: right; }

    .items-table tbody tr {
      border-bottom: 1px solid #f1f5f9;
    }

    .items-table tbody tr:last-child { border-bottom: none; }

    .items-table tbody tr:nth-child(even) { background: #f8fafc; }

    .items-table tbody td {
      padding: 14px 16px;
      font-size: 13px;
      color: #334155;
    }

    .items-table tbody td:last-child { text-align: right; font-weight: 600; }

    .item-desc {
      font-weight: 600;
      color: #0f172a;
      margin-bottom: 2px;
    }

    .item-meta {
      font-size: 11px;
      color: #94a3b8;
    }

    /* ── Totals ─────────────────────────────────────── */
    .totals-container {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .totals-box {
      width: 300px;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      overflow: hidden;
    }

    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 16px;
      font-size: 13px;
      border-bottom: 1px solid #f1f5f9;
    }

    .total-row:last-child {
      border-bottom: none;
      background: ${pal.totalBg};
      color: #ffffff;
      padding: 14px 16px;
      font-size: 15px;
      font-weight: 700;
    }

    .total-row .label { color: #64748b; font-size: 12px; }
    .total-row:last-child .label { color: #94a3b8; font-size: 13px; }
    .total-row .amount { font-weight: 600; color: #0f172a; }
    .total-row:last-child .amount { color: ${pal.totalText}; }

    /* ── Footer ───────────────────────────────────── */
    .footer {
      border-top: 1px solid #e2e8f0;
      padding: 10px 28px;
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      background: #f8fafc;
    }

    /* ── Print button ───────────────────────────────── */
    .print-btn-bar {
      margin-bottom: 20px;
      display: flex;
      gap: 12px;
    }

    .print-btn {
      background: ${pal.btnBg};
      color: #fff;
      border: none;
      padding: 12px 28px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.3px;
      transition: opacity .2s;
    }

    .print-btn:hover { opacity: 0.88; }

    .close-btn {
      background: #e2e8f0;
      color: #334155;
      border: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="page">
    <!-- Action buttons (hidden on print) -->
    <div class="print-btn-bar no-print">
      <button class="print-btn" onclick="window.print()">🖨️ Imprimer / Enregistrer PDF</button>
      <button class="close-btn" onclick="window.close()">✕ Fermer</button>
    </div>

    <div class="invoice-wrapper">
      <!-- Header -->
      <div class="header" style="padding: 20px 28px;">
        <div>
          <div class="company-name">${companyInfo.name || 'Atelier Mécanique'}</div>
          <div class="company-meta">
            ${companyInfo.address || 'Adresse de votre atelier'}<br/>
            ${companyInfo.phone || 'Téléphone'}
            ${companyInfo.email ? `<br/>${companyInfo.email}` : ''}
          </div>
        </div>
        <div class="invoice-id-block">
          <div class="invoice-label">Facture</div>
          <div class="invoice-number">#${facture.id}</div>
          <div class="invoice-date">Date : ${invoiceDate}</div>
        </div>
      </div>

      <!-- Status banner -->
      <div class="status-banner">
        <span class="status-label-text">Statut de la facture :</span>
        <span class="status-chip">
          <span class="status-dot"></span>
          ${statutLabel}
        </span>
      </div>

      <!-- Body -->
      <div class="body">

        <!-- Row 1: Client + Facture info -->
        <div class="grid-2">
          <!-- Client -->
          <div class="info-card">
            <div class="info-card-title">👤 Facturé à</div>
            <div class="info-name">${clientName}</div>
            ${client?.telephone ? `<div class="info-row">📞 ${client.telephone}</div>` : ''}
            ${client?.email ? `<div class="info-row">✉️ ${client.email}</div>` : ''}
            ${client?.adresse ? `<div class="info-row">📍 ${client.adresse}</div>` : ''}
          </div>

          <!-- Invoice info -->
          <div class="info-card">
            <div class="info-card-title">📋 Informations facture</div>
            <div class="info-row"><strong>N° Facture :</strong>&nbsp;#${facture.id}</div>
            <div class="info-row"><strong>Date :</strong>&nbsp;${invoiceDate}</div>
            <div class="info-row"><strong>Pièces utilisées :</strong>&nbsp;${nPieces}</div>
            <div class="info-row"><strong>Réparation :</strong>&nbsp;${reparation?.description || 'N/A'}</div>
          </div>
        </div>

        <!-- Row 2: Vehicle + Repair -->
        <div class="grid-2">
          <!-- Vehicle -->
          <div class="info-card accent">
            <div class="info-card-title">🚗 Véhicule</div>
            <div class="info-name">${vehicule?.marque || 'N/A'} ${vehicule?.modele || ''}</div>
            <div class="info-row"><strong>Immatriculation :</strong>&nbsp;${immat}</div>
            ${vehicule?.annee ? `<div class="info-row"><strong>Année :</strong>&nbsp;${vehicule.annee}</div>` : ''}
            ${vehicule?.couleur ? `<div class="info-row"><strong>Couleur :</strong>&nbsp;${vehicule.couleur}</div>` : ''}
            ${vehicule?.vin ? `<div class="info-row"><strong>VIN :</strong>&nbsp;${vehicule.vin}</div>` : ''}
          </div>

          <!-- Repair -->
          <div class="info-card accent">
            <div class="info-card-title">🔧 Réparation</div>
            <div class="info-name" style="font-size:13px;">${reparation?.description || 'N/A'}</div>
            <div class="info-row" style="margin-top:8px;">
              <strong>Statut :</strong>&nbsp;
              <span class="rep-status-chip">${reparationStatutLabel}</span>
            </div>
            ${reparation?.date_debut ? `<div class="info-row"><strong>Début :</strong>&nbsp;${reparation.date_debut}</div>` : ''}
            ${reparation?.date_fin ? `<div class="info-row"><strong>Fin :</strong>&nbsp;${reparation.date_fin}</div>` : ''}
          </div>
        </div>

        ${csvDetailsHtml}

        <!-- Mechanic (full width) -->
        <div style="margin-bottom:10px;">
          <div class="info-card mechanic">
            <div class="info-card-title">👨‍🔧 Mécanicien assigné</div>
            <div class="info-name">${mechanicName}</div>
            ${mechanicPhone ? `<div class="info-row">📞 ${mechanicPhone}</div>` : ''}
            ${mechanicEmail ? `<div class="info-row">✉️ ${mechanicEmail}</div>` : ''}
          </div>
        </div>

        <!-- Items table -->
        <div class="section-title">Détail des prestations</div>
        <table class="items-table" style="margin-bottom:10px;">
          <thead>
            <tr>
              <th>Description</th>
              <th style="text-align:center;">Qté / Pièces</th>
              <th>Montant HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="item-desc">${reparation?.description || 'Service mécanique'}</div>
                <div class="item-meta">Véhicule : ${vehicule?.marque || ''} ${vehicule?.modele || ''} — ${immat}</div>
              </td>
              <td style="text-align:center;">${nPieces}</td>
              <td>${formatPrice(sousTotal)} MAD</td>
            </tr>
          </tbody>
        </table>

        <!-- Totals -->
        <div class="totals-container">
          <div class="totals-box">
            <div class="total-row">
              <span class="label">Sous-total HT</span>
              <span class="amount">${formatPrice(sousTotal)} MAD</span>
            </div>
            ${taxes.length
              ? taxes
                .map(
                  (tax) => `
                    <div class="total-row">
                      <span class="label">${tax.label} (${tax.rate}%)</span>
                      <span class="amount">${formatPrice((sousTotal * tax.rate) / 100)} MAD</span>
                    </div>
                  `
                )
                .join('')
              : `
                <div class="total-row">
                  <span class="label">TVA (20%)</span>
                  <span class="amount">${formatPrice(effectiveTaxTotal)} MAD</span>
                </div>
              `}
            <div class="total-row">
              <span class="label">Total TTC</span>
              <span class="amount">${formatPrice(totalTTC)} MAD</span>
            </div>
          </div>
        </div>

      </div><!-- /.body -->

      <!-- Footer -->
      <div class="footer">
        Merci pour votre confiance. &nbsp;•&nbsp; Cette facture est générée automatiquement par le système de gestion de l'atelier.
        <br/>
        ${companyInfo.name || 'Atelier Mécanique'} &nbsp;•&nbsp; ${companyInfo.phone || ''} ${companyInfo.email ? `&nbsp;•&nbsp; ${companyInfo.email}` : ''}
      </div>
    </div><!-- /.invoice-wrapper -->
  </div>
</body>
</html>`;
};
