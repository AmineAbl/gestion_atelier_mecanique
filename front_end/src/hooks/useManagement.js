import { useState, useEffect, useCallback } from 'react';
import { clientsAPI, facturesAPI, reparationsAPI, dashboardAPI } from '../services/api';

/**
 * ============================================================
 * HOOK FOR MANAGING CLIENTS CRUD OPERATIONS
 * ============================================================
 * 
 * Purpose: Fetch and manage client data from Laravel backend API
 * 
 * Features:
 * - Fetches all clients on component mount
 * - Provides CRUD operation methods (add, update, delete)
 * - Starts with empty array (0 clients) until data is added
 * - Error handling for API failures
 * 
 * Initial State: [] (empty array - no demo data)
 */
export const useClients = () => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all clients from backend on component mount
  useEffect(() => {
    const fetchClients = async () => {
      try {
        setLoading(true);
        const response = await clientsAPI.getAll();
        setClients(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching clients:', err);
        setError(err.message || 'Failed to load clients');
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  // Create new client via API
  const addClient = useCallback(async (newClient) => {
    try {
      const response = await clientsAPI.create(newClient);
      setClients(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating client:', err);
      throw err;
    }
  }, []);

  // Update existing client via API
  const updateClient = useCallback(async (id, updatedData) => {
    try {
      const response = await clientsAPI.update(id, updatedData);
      setClients(prev =>
        prev.map(client =>
          client.id === id ? response.data : client
        )
      );
    } catch (err) {
      console.error('Error updating client:', err);
      throw err;
    }
  }, []);

  // Delete client via API
  const deleteClient = useCallback(async (id) => {
    try {
      await clientsAPI.delete(id);
      setClients(prev => prev.filter(client => client.id !== id));
      if (selectedClient?.id === id) {
        setSelectedClient(null);
      }
    } catch (err) {
      console.error('Error deleting client:', err);
      throw err;
    }
  }, [selectedClient]);

  return {
    clients,
    selectedClient,
    setSelectedClient,
    addClient,
    updateClient,
    deleteClient,
    loading,
    error
  };
};

/**
 * ============================================================
 * HOOK FOR MANAGING FACTURES (INVOICES) CRUD OPERATIONS
 * ============================================================
 * 
 * Purpose: Fetch and manage invoice data from Laravel backend API
 * 
 * Features:
 * - Fetches all factures on component mount
 * - Provides CRUD operation methods
 * - Starts with empty array (0 invoices) until data is added
 * - Error handling for API failures
 * 
 * Initial State: [] (empty array - all counters start at 0)
 */
export const useFactures = () => {
  const [factures, setFactures] = useState([]);
  const [selectedFacture, setSelectedFacture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all factures from backend on component mount
  useEffect(() => {
    const fetchFactures = async () => {
      try {
        setLoading(true);
        const response = await facturesAPI.getAll();
        setFactures(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching factures:', err);
        setError(err.message || 'Failed to load factures');
        setFactures([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFactures();
  }, []);

  // Create new facture via API
  const addFacture = useCallback(async (newFacture) => {
    try {
      const response = await facturesAPI.create(newFacture);
      setFactures(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating facture:', err);
      throw err;
    }
  }, []);

  // Update existing facture via API
  const updateFacture = useCallback(async (id, updatedData) => {
    try {
      const response = await facturesAPI.update(id, updatedData);
      setFactures(prev =>
        prev.map(facture =>
          facture.id === id ? response.data : facture
        )
      );
    } catch (err) {
      console.error('Error updating facture:', err);
      throw err;
    }
  }, []);

  // Delete facture via API
  const deleteFacture = useCallback(async (id) => {
    try {
      await facturesAPI.delete(id);
      setFactures(prev => prev.filter(facture => facture.id !== id));
      if (selectedFacture?.id === id) {
        setSelectedFacture(null);
      }
    } catch (err) {
      console.error('Error deleting facture:', err);
      throw err;
    }
  }, [selectedFacture]);

  // Filter factures by client ID
  const getFacturesByClient = useCallback((clientId) => {
    return factures.filter(f => f.client_id === clientId);
  }, [factures]);

  return {
    factures,
    selectedFacture,
    setSelectedFacture,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacturesByClient,
    loading,
    error
  };
};

/**
 * ============================================================
 * HOOK FOR MANAGING REPARATIONS (REPAIRS) CRUD OPERATIONS
 * ============================================================
 * 
 * Purpose: Fetch and manage repair data from Laravel backend API
 * 
 * Features:
 * - Fetches all reparations on component mount
 * - Provides CRUD operation methods
 * - Starts with empty array (0 repairs) until data is added
 * - Error handling for API failures
 * 
 * Initial State: [] (empty array - no demo data)
 */
export const useReparations = () => {
  const [reparations, setReparations] = useState([]);
  const [selectedReparation, setSelectedReparation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all reparations from backend on component mount
  useEffect(() => {
    const fetchReparations = async () => {
      try {
        setLoading(true);
        const response = await reparationsAPI.getAll();
        setReparations(response.data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching reparations:', err);
        setError(err.message || 'Failed to load reparations');
        setReparations([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReparations();
  }, []);

  // Create new reparation via API
  const addReparation = useCallback(async (newReparation) => {
    try {
      const response = await reparationsAPI.create(newReparation);
      setReparations(prev => [...prev, response.data]);
      return response.data;
    } catch (err) {
      console.error('Error creating reparation:', err);
      throw err;
    }
  }, []);

  // Update existing reparation via API
  const updateReparation = useCallback(async (id, updatedData) => {
    try {
      const response = await reparationsAPI.update(id, updatedData);
      setReparations(prev =>
        prev.map(reparation =>
          reparation.id === id ? response.data : reparation
        )
      );
    } catch (err) {
      console.error('Error updating reparation:', err);
      throw err;
    }
  }, []);

  // Delete reparation via API
  const deleteReparation = useCallback(async (id) => {
    try {
      await reparationsAPI.delete(id);
      setReparations(prev => prev.filter(reparation => reparation.id !== id));
      if (selectedReparation?.id === id) {
        setSelectedReparation(null);
      }
    } catch (err) {
      console.error('Error deleting reparation:', err);
      throw err;
    }
  }, [selectedReparation]);

  // Filter reparations by client ID
  const getReparationsByClient = useCallback((clientId) => {
    return reparations.filter(r => r.client_id === clientId);
  }, [reparations]);

  return {
    reparations,
    selectedReparation,
    setSelectedReparation,
    addReparation,
    updateReparation,
    deleteReparation,
    getReparationsByClient,
    loading,
    error
  };
};

/**
 * ============================================================
 * HOOK FOR MANAGING VEHICULES (VEHICLES)
 * ============================================================
 * 
 * Purpose: Manage vehicle data (cars being repaired)
 * 
 * Features:
 * - Starts with empty array (0 vehicles)
 * - Will be populated when mechanic adds vehicle data
 * - Provides basic CRUD operations
 * 
 * Initial State: [] (empty array)
 */
export const useVehicules = () => {
  const [vehicules, setVehicules] = useState([]);

  const addVehicule = useCallback((newVehicule) => {
    const vehiculeWithId = {
      ...newVehicule,
      id: Math.max(...vehicules.map(v => v.id || 0), 0) + 1,
    };
    setVehicules(prev => [...prev, vehiculeWithId]);
    return vehiculeWithId;
  }, [vehicules]);

  const updateVehicule = useCallback((id, updatedData) => {
    setVehicules(prev =>
      prev.map(vehicule =>
        vehicule.id === id ? { ...vehicule, ...updatedData } : vehicule
      )
    );
  }, []);

  const deleteVehicule = useCallback((id) => {
    setVehicules(prev => prev.filter(vehicule => vehicule.id !== id));
  }, []);

  return {
    vehicules,
    addVehicule,
    updateVehicule,
    deleteVehicule,
  };
};

/**
 * ============================================================
 * HOOK FOR DASHBOARD STATISTICS
 * ============================================================
 * 
 * Purpose: Fetch real-time financial metrics from backend
 * 
 * Features:
 * - Calculates metrics from actual data in database
 * - Starts at 0 when database is empty
 * - Updates as new factures/reparations are added
 */
export const useDashboardStats = () => {
  const [stats, setStats] = useState({
    total_revenue: 0,
    total_pending: 0,
    total_costs: 0,
    total_profit: 0,
    profit_margin: 0,
    completed_repairs: 0,
    active_clients: 0,
    invoices_this_month: 0,
    completion_rate: 0,
    recovery_rate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await dashboardAPI.getStats();
        setStats(response);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.message);
        // Set default zero values on error
        setStats({
          total_revenue: 0,
          total_pending: 0,
          total_costs: 0,
          total_profit: 0,
          profit_margin: 0,
          completed_repairs: 0,
          active_clients: 0,
          invoices_this_month: 0,
          completion_rate: 0,
          recovery_rate: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading, error };
};

