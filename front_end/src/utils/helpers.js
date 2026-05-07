/**
 * Utility functions for the Accountant interface
 */

export const formatCurrency = (amount, currency = 'MAD') => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

export const getStatusBadgeColor = (status) => {
  const statusColors = {
    'paid': 'bg-green-100 text-green-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'completed': 'bg-blue-100 text-blue-800',
    'in-progress': 'bg-purple-100 text-purple-800',
    'cancelled': 'bg-red-100 text-red-800'
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
};

export const getStatusLabel = (status) => {
  const labels = {
    'paid': 'Payée',
    'pending': 'En attente',
    'completed': 'Terminée',
    'in-progress': 'En cours',
    'cancelled': 'Annulée'
  };
  return labels[status] || status;
};

export const calculateTotalWithTax = (amount, taxRate = 0.20) => {
  return amount * (1 + taxRate);
};

export const calculateInvoiceTotal = (reparationCost, taxRate = 0.20) => {
  return {
    subtotal: reparationCost,
    tax: reparationCost * taxRate,
    total: reparationCost * (1 + taxRate)
  };
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone) => {
  const phoneRegex = /^(\+33|0)[1-9](?:[0-9]{8})$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const generateInvoiceNumber = (factureId, date) => {
  const dateStr = date.replace(/-/g, '');
  return `FAC-${dateStr}-${String(factureId).padStart(4, '0')}`;
};

export const calculateFinancialMetrics = (factures, reparations) => {
  const totalRevenue = factures
    .filter(f => f.statut === 'paid')
    .reduce((sum, f) => sum + f.prix_total, 0);

  const totalPending = factures
    .filter(f => f.statut === 'pending')
    .reduce((sum, f) => sum + f.prix_total, 0);

  const totalCosts = reparations.reduce((sum, r) => sum + r.cout, 0);

  const totalProfit = totalRevenue - totalCosts;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  return {
    totalRevenue,
    totalPending,
    totalCosts,
    totalProfit,
    profitMargin: profitMargin.toFixed(2)
  };
};

export const getRepairsOverview = (reparations) => {
  const completed = reparations.filter(r => r.statut === 'completed').length;
  const inProgress = reparations.filter(r => r.statut === 'in-progress').length;
  const pending = reparations.filter(r => r.statut === 'pending').length;

  return {
    total: reparations.length,
    completed,
    inProgress,
    pending,
    completionRate: reparations.length > 0 ? ((completed / reparations.length) * 100).toFixed(2) : 0
  };
};

export const sortByDate = (items, dateField = 'createdAt', ascending = false) => {
  return [...items].sort((a, b) => {
    const dateA = new Date(a[dateField]);
    const dateB = new Date(b[dateField]);
    return ascending ? dateA - dateB : dateB - dateA;
  });
};

export const filterByStatus = (items, status) => {
  return items.filter(item => item.statut === status);
};

export const searchClients = (clients, searchTerm) => {
  const term = searchTerm.toLowerCase();
  return clients.filter(client =>
    client.nom.toLowerCase().includes(term) ||
    client.prenom.toLowerCase().includes(term) ||
    client.telephone.includes(term) ||
    client.email?.toLowerCase().includes(term)
  );
};
