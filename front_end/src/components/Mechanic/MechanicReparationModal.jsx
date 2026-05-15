import React, { useEffect, useState, useCallback } from 'react';
import {
  Alert,
  Button,
  Input,
  Modal,
  Select,
  Spinner,
} from '../common/UIComponents';
import { useTheme } from '../../context/ThemeContext';
import { reparationsAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/helpers';

const REPARATION_STATUTS = [
  { value: 'pending', label: 'En attente' },
  { value: 'in-progress', label: 'En cours' },
  { value: 'completed', label: 'Terminée' },
  { value: 'cancelled', label: 'Annulée' },
];

function dateInputValue(iso) {
  if (!iso) return '';
  const s = String(iso);
  return s.length >= 10 ? s.slice(0, 10) : '';
}

function nextLineKey() {
  return typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `ln-${Date.now()}-${Math.random()}`;
}

function repairToLines(repair) {
  const list = repair?.pieces;
  if (!Array.isArray(list) || list.length === 0) return [];
  return list.map((p) => ({
    key: nextLineKey(),
    piece_id: String(p.id),
    quantite: Number(p.pivot?.quantite ?? 1),
    prix_utilise: Number(p.pivot?.prix_utilise ?? p.prix ?? 0),
  }));
}

export default function MechanicReparationModal({
  isOpen,
  onClose,
  reparationId,
  piecesCatalog,
  onSaved,
}) {
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [repair, setRepair] = useState(null);
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState('pending');
  const [cout, setCout] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [datePrevueFin, setDatePrevueFin] = useState('');
  const [lines, setLines] = useState([]);

  const loadRepair = useCallback(async () => {
    if (!reparationId) return;
    setLoadError(null);
    setLoading(true);
    try {
      const data = await reparationsAPI.getById(reparationId);
      setRepair(data);
      setDescription(data.description || '');
      setStatut(data.statut || 'pending');
      setCout(data.cout != null ? String(data.cout) : '');
      setDateDebut(dateInputValue(data.date_debut));
      setDateFin(dateInputValue(data.date_fin));
      setDatePrevueFin(dateInputValue(data.date_prevue_fin));
      setLines(repairToLines(data));
    } catch (e) {
      setLoadError(e.message || 'Impossible de charger la réparation');
      setRepair(null);
    } finally {
      setLoading(false);
    }
  }, [reparationId]);

  useEffect(() => {
    if (isOpen && reparationId) {
      setSaveError(null);
      loadRepair();
    }
  }, [isOpen, reparationId, loadRepair]);

  const pieceOptions = (Array.isArray(piecesCatalog) ? piecesCatalog : []).map((p) => ({
    value: String(p.id),
    label: `${p.nom} (${formatCurrency(p.prix)})`,
  }));

  const addLine = () => {
    const first = pieceOptions[0]?.value || '';
    const cat = Array.isArray(piecesCatalog) ? piecesCatalog : [];
    const def = first ? cat.find((p) => String(p.id) === first) : null;
    setLines((prev) => [
      ...prev,
      {
        key: nextLineKey(),
        piece_id: first,
        quantite: 1,
        prix_utilise: def != null ? Number(def.prix) : 0,
      },
    ]);
  };

  const removeLine = (key) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  };

  const updateLine = (key, patch) => {
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.piece_id != null && patch.prix_utilise === undefined) {
          const cat = Array.isArray(piecesCatalog) ? piecesCatalog : [];
          const pc = cat.find((p) => String(p.id) === String(patch.piece_id));
          if (pc) next.prix_utilise = Number(pc.prix);
        }
        return next;
      })
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    if (!repair?.id) return;
    const coutNum = Number(cout);
    if (Number.isNaN(coutNum) || coutNum < 0) {
      setSaveError('Le coût doit être un nombre positif ou zéro.');
      return;
    }
    for (const ln of lines) {
      if (!ln.piece_id) {
        setSaveError('Chaque ligne doit avoir une pièce sélectionnée.');
        return;
      }
      if (!Number.isFinite(Number(ln.quantite)) || Number(ln.quantite) < 1) {
        setSaveError('Les quantités doivent être des entiers au moins égaux à 1.');
        return;
      }
      const pu = Number(ln.prix_utilise);
      if (Number.isNaN(pu) || pu < 0) {
        setSaveError('Les prix utilisés doivent être des nombres positifs ou zéro.');
        return;
      }
    }
    try {
      const piecesPayload = lines.map((ln) => ({
        piece_id: Number(ln.piece_id),
        quantite: Number(ln.quantite),
        prix_utilise: Number(ln.prix_utilise),
      }));
      await reparationsAPI.update(repair.id, {
        description,
        statut,
        cout: coutNum,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        date_prevue_fin: datePrevueFin || null,
        pieces: piecesPayload,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Enregistrement impossible');
    }
  };

  const client = repair?.vehicule?.client;
  const veh = repair?.vehicule;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Fiche réparation" size="xl">
      {loading && (
        <div className="flex flex-col items-center gap-3 py-8">
          <Spinner />
        </div>
      )}
      {!loading && loadError && (
        <Alert type="error" message={loadError} onClose={() => setLoadError(null)} />
      )}
      {!loading && repair && (
        <form onSubmit={handleSubmit} className="space-y-4">
          {saveError && <Alert type="error" message={saveError} onClose={() => setSaveError(null)} />}

          <div
            className={`rounded-xl border p-4 text-sm ${
              isDark ? 'border-white/10 bg-slate-800/50 text-gray-200' : 'border-gray-200 bg-gray-50 text-gray-800'
            }`}
          >
            <p className="font-semibold mb-2">Véhicule & client</p>
            <p>
              {veh
                ? `${veh.marque || ''} ${veh.modele || ''} · ${veh.immatriculation || veh.immat || '—'}`
                : '—'}
            </p>
            <p className="mt-1">
              {client
                ? `${client.prenom || ''} ${client.nom || ''} · ${client.telephone || ''}`
                : '—'}
            </p>
            <p className={`mt-2 text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Réparation #{repair.id} · créée le {formatDate(repair.created_at)}
            </p>
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-4 py-2.5 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-0 transition-all duration-300 ${
                isDark
                  ? 'bg-slate-800 border-white/10 text-white placeholder-gray-500 focus:border-blue-500 focus:ring-blue-500/50'
                  : 'bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-200'
              }`}
            />
          </div>

          <Select
            label="Statut"
            value={statut}
            onChange={(e) => setStatut(e.target.value)}
            options={REPARATION_STATUTS}
            required
          />

          <Input
            label="Coût (main d'œuvre / atelier)"
            type="number"
            min="0"
            step="0.01"
            value={cout}
            onChange={(e) => setCout(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              label="Date début"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
            />
            <Input
              label="Fin prévue"
              type="date"
              value={datePrevueFin}
              onChange={(e) => setDatePrevueFin(e.target.value)}
            />
            <Input
              label="Date fin"
              type="date"
              value={dateFin}
              onChange={(e) => setDateFin(e.target.value)}
            />
          </div>

          <div
            className={`rounded-xl border p-4 ${isDark ? 'border-white/10 bg-slate-800/40' : 'border-gray-200 bg-white'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Pièces utilisées</h3>
              <Button type="button" variant="secondary" size="sm" onClick={addLine} disabled={!pieceOptions.length}>
                + Ligne
              </Button>
            </div>
            {!pieceOptions.length && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Aucune pièce en catalogue. Le responsable peut ajouter des références pièces.
              </p>
            )}
            <div className="space-y-3">
              {lines.map((ln) => (
                <div
                  key={ln.key}
                  className={`flex flex-wrap gap-2 items-end p-3 rounded-lg border ${
                    isDark ? 'border-white/10 bg-slate-900/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex-1 min-w-[180px]">
                    <Select
                      label="Pièce"
                      value={ln.piece_id}
                      onChange={(e) => updateLine(ln.key, { piece_id: e.target.value })}
                      options={pieceOptions}
                      required
                    />
                  </div>
                  <div className="w-24">
                    <Input
                      label="Qté"
                      type="number"
                      min="1"
                      step="1"
                      value={String(ln.quantite)}
                      onChange={(e) =>
                        updateLine(ln.key, { quantite: parseInt(e.target.value, 10) || 1 })
                      }
                      required
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      label="Prix utilisé"
                      type="number"
                      min="0"
                      step="0.01"
                      value={String(ln.prix_utilise)}
                      onChange={(e) =>
                        updateLine(ln.key, { prix_utilise: parseFloat(e.target.value) || 0 })
                      }
                      required
                    />
                  </div>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeLine(ln.key)}>
                    Retirer
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <Button type="submit">Enregistrer</Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
