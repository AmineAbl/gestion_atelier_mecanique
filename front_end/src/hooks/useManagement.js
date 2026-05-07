import { useState, useCallback } from 'react';
import {
  mockClients,
  mockFactures,
  mockReparations,
  mockVehicules
} from '../data/mockData';

/**
 * Hook for managing Clients CRUD operations
 * Future API calls will replace these state operations
 */
export const useClients = () => {
  const [clients, setClients] = useState(mockClients);
  const [selectedClient, setSelectedClient] = useState(null);

  const addClient = useCallback((newClient) => {
    const clientWithId = {
      ...newClient,
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setClients(prev => [...prev, clientWithId]);
    return clientWithId;
  }, [clients]);

  const updateClient = useCallback((id, updatedData) => {
    setClients(prev =>
      prev.map(client =>
        client.id === id ? { ...client, ...updatedData } : client
      )
    );
  }, []);

  const deleteClient = useCallback((id) => {
    setClients(prev => prev.filter(client => client.id !== id));
    if (selectedClient?.id === id) {
      setSelectedClient(null);
    }
  }, [selectedClient]);

  return {
    clients,
    selectedClient,
    setSelectedClient,
    addClient,
    updateClient,
    deleteClient
  };
};

/**
 * Hook for managing Factures (Invoices) CRUD operations
 * Future API calls will replace these state operations
 */
export const useFactures = () => {
  const [factures, setFactures] = useState(mockFactures);
  const [selectedFacture, setSelectedFacture] = useState(null);

  const addFacture = useCallback((newFacture) => {
    const factureWithId = {
      ...newFacture,
      id: Math.max(...factures.map(f => f.id), 0) + 1,
      date_validation: newFacture.date_validation || new Date().toISOString().split('T')[0]
    };
    setFactures(prev => [...prev, factureWithId]);
    return factureWithId;
  }, [factures]);

  const updateFacture = useCallback((id, updatedData) => {
    setFactures(prev =>
      prev.map(facture =>
        facture.id === id ? { ...facture, ...updatedData } : facture
      )
    );
  }, []);

  const deleteFacture = useCallback((id) => {
    setFactures(prev => prev.filter(facture => facture.id !== id));
    if (selectedFacture?.id === id) {
      setSelectedFacture(null);
    }
  }, [selectedFacture]);

  const getFacturesByClient = useCallback((clientId) => {
    return factures.filter(f => f.clientId === clientId);
  }, [factures]);

  return {
    factures,
    selectedFacture,
    setSelectedFacture,
    addFacture,
    updateFacture,
    deleteFacture,
    getFacturesByClient
  };
};

/**
 * Hook for managing Reparations CRUD operations
 * Future API calls will replace these state operations
 */
export const useReparations = () => {
  const [reparations, setReparations] = useState(mockReparations);
  const [selectedReparation, setSelectedReparation] = useState(null);

  const addReparation = useCallback((newReparation) => {
    const reparationWithId = {
      ...newReparation,
      id: Math.max(...reparations.map(r => r.id), 0) + 1,
      date_debut: newReparation.date_debut || new Date().toISOString().split('T')[0]
    };
    setReparations(prev => [...prev, reparationWithId]);
    return reparationWithId;
  }, [reparations]);

  const updateReparation = useCallback((id, updatedData) => {
    setReparations(prev =>
      prev.map(reparation =>
        reparation.id === id ? { ...reparation, ...updatedData } : reparation
      )
    );
  }, []);

  const deleteReparation = useCallback((id) => {
    setReparations(prev => prev.filter(reparation => reparation.id !== id));
    if (selectedReparation?.id === id) {
      setSelectedReparation(null);
    }
  }, [selectedReparation]);

  const getReparationsByClient = useCallback((clientId) => {
    return reparations.filter(r => r.clientId === clientId);
  }, [reparations]);

  return {
    reparations,
    selectedReparation,
    setSelectedReparation,
    addReparation,
    updateReparation,
    deleteReparation,
    getReparationsByClient
  };
};

/**
 * Hook for managing Vehicules
 */
export const useVehicules = () => {
  const [vehicules, setVehicules] = useState(mockVehicules);

  const getVehiculesByClient = useCallback((clientId) => {
    return vehicules.filter(v => v.clientId === clientId);
  }, [vehicules]);

  return {
    vehicules,
    getVehiculesByClient
  };
};
