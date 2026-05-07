// Mock data for static development
export const mockClients = [
  {
    id: 1,
    nom: "Dupont",
    prenom: "Jean",
    telephone: "+33 6 12 34 56 78",
    email: "jean.dupont@email.com",
    createdAt: "2026-01-15"
  },
  {
    id: 2,
    nom: "Martin",
    prenom: "Marie",
    telephone: "+33 6 98 76 54 32",
    email: "marie.martin@email.com",
    createdAt: "2026-02-10"
  },
  {
    id: 3,
    nom: "Leclerc",
    prenom: "Pierre",
    telephone: "+33 6 11 22 33 44",
    email: "pierre.leclerc@email.com",
    createdAt: "2026-03-05"
  },
  {
    id: 4,
    nom: "Bernard",
    prenom: "Sophie",
    telephone: "+33 6 55 66 77 88",
    email: "sophie.bernard@email.com",
    createdAt: "2026-03-20"
  }
];

export const mockReparations = [
  {
    id: 1,
    description: "Réparation moteur",
    statut: "completed",
    date_debut: "2026-04-01",
    date_fin: "2026-04-05",
    date_prevue_fin: "2026-04-07",
    cout: 450.00,
    clientId: 1,
    vehiculeId: 1,
    userId: 1
  },
  {
    id: 2,
    description: "Changement de pneus",
    statut: "in-progress",
    date_debut: "2026-04-10",
    date_fin: null,
    date_prevue_fin: "2026-04-12",
    cout: 200.00,
    clientId: 2,
    vehiculeId: 2,
    userId: 1
  },
  {
    id: 3,
    description: "Révision complète",
    statut: "pending",
    date_debut: null,
    date_fin: null,
    date_prevue_fin: "2026-04-18",
    cout: 350.00,
    clientId: 3,
    vehiculeId: 3,
    userId: 2
  },
  {
    id: 4,
    description: "Réparation freins",
    statut: "completed",
    date_debut: "2026-03-25",
    date_fin: "2026-03-28",
    date_prevue_fin: "2026-03-28",
    cout: 280.00,
    clientId: 1,
    vehiculeId: 1,
    userId: 1
  },
  {
    id: 5,
    description: "Remplacement batterie",
    statut: "completed",
    date_debut: "2026-03-30",
    date_fin: "2026-03-31",
    date_prevue_fin: "2026-04-01",
    cout: 150.00,
    clientId: 4,
    vehiculeId: 4,
    userId: 2
  }
];

export const mockFactures = [
  {
    id: 1,
    total_piece: 2,
    cout: 450.00,
    prix_total: 540.00,
    date_validation: "2026-04-06",
    statut: "paid",
    reparationId: 1,
    clientId: 1,
    userId: 1
  },
  {
    id: 2,
    total_piece: 4,
    cout: 200.00,
    prix_total: 240.00,
    date_validation: null,
    statut: "pending",
    reparationId: 2,
    clientId: 2,
    userId: 1
  },
  {
    id: 3,
    total_piece: 1,
    cout: 350.00,
    prix_total: 420.00,
    date_validation: null,
    statut: "pending",
    reparationId: 3,
    clientId: 3,
    userId: 2
  },
  {
    id: 4,
    total_piece: 2,
    cout: 280.00,
    prix_total: 336.00,
    date_validation: "2026-03-29",
    statut: "paid",
    reparationId: 4,
    clientId: 1,
    userId: 1
  },
  {
    id: 5,
    total_piece: 1,
    cout: 150.00,
    prix_total: 180.00,
    date_validation: "2026-04-02",
    statut: "paid",
    reparationId: 5,
    clientId: 4,
    userId: 2
  }
];

export const mockVehicules = [
  {
    id: 1,
    marque: "Peugeot",
    modele: "308",
    immatriculation: "AB-123-CD",
    annee: 2019,
    clientId: 1
  },
  {
    id: 2,
    marque: "Renault",
    modele: "Clio",
    immatriculation: "EF-456-GH",
    annee: 2020,
    clientId: 2
  },
  {
    id: 3,
    marque: "Citroën",
    modele: "C5",
    immatriculation: "IJ-789-KL",
    annee: 2018,
    clientId: 3
  },
  {
    id: 4,
    marque: "Toyota",
    modele: "Corolla",
    immatriculation: "MN-012-OP",
    annee: 2021,
    clientId: 4
  }
];

// Helper functions
export const getClientById = (id) => mockClients.find(c => c.id === id);
export const getReparationsByClient = (clientId) => mockReparations.filter(r => r.clientId === clientId);
export const getFacturesByClient = (clientId) => mockFactures.filter(f => f.clientId === clientId);
export const getVehiculesByClient = (clientId) => mockVehicules.filter(v => v.clientId === clientId);

export const calculateFinancialStats = () => {
  const totalRevenue = mockFactures
    .filter(f => f.statut === 'paid')
    .reduce((sum, f) => sum + f.prix_total, 0);
  
  const totalPending = mockFactures
    .filter(f => f.statut === 'pending')
    .reduce((sum, f) => sum + f.prix_total, 0);
  
  const totalCost = mockReparations.reduce((sum, r) => sum + r.cout, 0);
  
  const totalProfit = totalRevenue - totalCost;
  
  return {
    totalRevenue,
    totalPending,
    totalCost,
    totalProfit,
    profitMargin: totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(2) : 0
  };
};
