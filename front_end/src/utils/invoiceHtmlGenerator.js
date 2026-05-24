/**
 * Generate beautiful HTML invoice with embedded styles
 * Uses react-pdf-html for PDF conversion
 */

// Repair type icons mapping
const repairIcons = {
  'vidange': '🛢️',
  'pneu': '🛞',
  'frein': '🛑',
  'batterie': '🔋',
  'plaquette': '⚙️',
  'révision': '🔧',
  'climatisation': '❄️',
  'moteur': '⚡',
  'carrosserie': '🚗',
  'électrique': '⚡',
  'changement': '🔄',
  'remplacement': '🔄',
  'réparation': '🔧',
};

// Function to get icon for repair type
const getRepairIcon = (description) => {
  const desc = description?.toLowerCase() || '';
  for (const [key, icon] of Object.entries(repairIcons)) {
    if (desc.includes(key)) {
      return icon;
    }
  }
  return '🔧'; // Default icon
};

export const generateInvoiceHtml = async (facture, client, reparation, vehicule, mechanic, companyInfo = {}) => {
  const repairIcon = getRepairIcon(reparation?.description);

    const formatPrice = (amount) => {
      const num = Number(amount || 0).toFixed(2);
      const parts = num.split('.');
      const integerPart = parts[0];
      const decimalPart = parts[1];
      const formatted = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
      return `${formatted},${decimalPart}`;
    };

    const sousTotal = facture.cout || 0;
    const tva = sousTotal * 0.2;
    const totalTTC = facture.prix_total || 0;
    const invoiceDate = facture.date_validation || new Date().toISOString().split('T')[0];

    const html = `
      <div style="font-family: Helvetica; color: #111827; font-size: 12px; line-height: 1.5;">
        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="background-color: #0f172a; color: #ffffff; padding: 20px;">
              <div style="font-size: 18px; font-weight: bold; letter-spacing: 0.5px;">${companyInfo.name || 'Atelier Mécanique'}</div>
              <div style="font-size: 10px; margin-top: 6px; color: #e2e8f0;">${companyInfo.address || 'Adresse de votre atelier'}</div>
              <div style="font-size: 10px; color: #e2e8f0;">${companyInfo.phone || 'Téléphone'}</div>
            </td>
            <td style="background-color: #0f172a; color: #ffffff; padding: 20px; text-align: right;">
              <div style="font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Facture</div>
              <div style="font-size: 16px; font-weight: bold; margin-top: 6px;">#${facture.id}</div>
              <div style="font-size: 10px; color: #cbd5f5; margin-top: 6px;">Date: ${invoiceDate}</div>
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="width: 50%; padding: 12px; border: 1px solid #e5e7eb;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;">Facturé à</div>
              <div style="font-size: 13px; font-weight: bold; margin-top: 6px;">${client?.prenom || ''} ${client?.nom || ''}</div>
              <div style="font-size: 11px; color: #334155;">${client?.telephone || ''}</div>
              <div style="font-size: 11px; color: #334155;">${client?.email || ''}</div>
            </td>
            <td style="width: 50%; padding: 12px; border: 1px solid #e5e7eb;">
              <div style="font-size: 10px; color: #64748b; text-transform: uppercase; letter-spacing: 0.6px;">Informations facture</div>
              <div style="font-size: 11px; margin-top: 6px;"><strong>Statut:</strong> ${facture.statut || 'N/A'}</div>
              <div style="font-size: 11px; margin-top: 2px;"><strong>Pièces:</strong> ${facture.total_piece ?? 0}</div>
              <div style="font-size: 11px; margin-top: 2px;"><strong>Réparation:</strong> ${reparation?.description || 'N/A'}</div>
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f8fafc;">
              <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 6px;">Véhicule</div>
              <div style="font-size: 11px;"><strong>Marque:</strong> ${vehicule?.marque || 'N/A'}</div>
              <div style="font-size: 11px; margin-top: 2px;"><strong>Modèle:</strong> ${vehicule?.modele || 'N/A'}</div>
              <div style="font-size: 11px; margin-top: 2px;"><strong>Immatriculation:</strong> ${vehicule?.immat || vehicule?.immatriculation || 'N/A'}</div>
            </td>
            <td style="padding: 12px; border: 1px solid #e5e7eb; background-color: #f8fafc;">
              <div style="font-weight: bold; font-size: 12px; color: #0f172a; margin-bottom: 6px;">Réparation ${repairIcon}</div>
              <div style="font-size: 11px;"><strong>Description:</strong> ${reparation?.description || 'N/A'}</div>
              <div style="font-size: 11px; margin-top: 2px;"><strong>Statut:</strong> ${reparation?.statut || 'N/A'}</div>
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="padding: 12px; border: 1px solid #fde68a; background-color: #fffbeb;">
              <div style="font-size: 10px; color: #b45309; text-transform: uppercase; letter-spacing: 0.6px;">Mécanicien assigné</div>
              <div style="font-size: 12px; font-weight: bold; margin-top: 4px;">${mechanic?.prenom || ''} ${mechanic?.nom || ''}</div>
            </td>
          </tr>
        </table>

        <table style="width: 100%; margin-bottom: 16px;">
          <thead>
            <tr>
              <th style="text-align: left; padding: 10px; background-color: #e2e8f0; font-size: 11px;">Description</th>
              <th style="text-align: right; padding: 10px; background-color: #e2e8f0; font-size: 11px;">Montant HT</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px;">${reparation?.description || 'Service mécanique'}</td>
              <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; font-size: 11px; text-align: right;">${formatPrice(sousTotal)} MAD</td>
            </tr>
          </tbody>
        </table>

        <table style="width: 100%; margin-bottom: 16px;">
          <tr>
            <td style="width: 60%;"></td>
            <td style="width: 40%; border: 1px solid #e5e7eb; padding: 12px; background-color: #f8fafc;">
              <div style="display: flex; justify-content: space-between; font-size: 11px;">
                <span>Sous-total</span>
                <span>${formatPrice(sousTotal)} MAD</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 11px; margin-top: 4px;">
                <span>TVA (20%)</span>
                <span>${formatPrice(tva)} MAD</span>
              </div>
              <div style="display: flex; justify-content: space-between; font-size: 12px; font-weight: bold; border-top: 1px solid #e5e7eb; padding-top: 6px; margin-top: 6px;">
                <span>Total TTC</span>
                <span>${formatPrice(totalTTC)} MAD</span>
              </div>
            </td>
          </tr>
        </table>

        <div style="text-align: center; color: #64748b; font-size: 10px; border-top: 1px solid #e5e7eb; padding-top: 10px;">
          Merci pour votre confiance. Cette facture est générée automatiquement.
        </div>
      </div>
    `;

  return html;
};
