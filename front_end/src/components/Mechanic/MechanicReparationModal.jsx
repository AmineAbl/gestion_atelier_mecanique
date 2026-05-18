import React, { useEffect, useState, useCallback, useMemo } from 'react';
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

function sumLines(lines) {
  return (lines || []).reduce(
    (sum, ln) => sum + Number(ln.quantite || 0) * Number(ln.prix_utilise || 0),
    0
  );
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

function usedPieceIdsFromLines(lines) {
  return new Set(
    (lines || [])
      .map((ln) => ln.piece_id)
      .filter(Boolean)
      .map(String)
  );
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
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [repair, setRepair] = useState(null);
  const [description, setDescription] = useState('');
  const [statut, setStatut] = useState('pending');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [datePrevueFin, setDatePrevueFin] = useState('');
  const [lines, setLines] = useState([]);
  const [piecePickerOpen, setPiecePickerOpen] = useState(false);
  const [pickerSelectedId, setPickerSelectedId] = useState('');

  const catalog = useMemo(
    () => (Array.isArray(piecesCatalog) ? piecesCatalog : []),
    [piecesCatalog]
  );

  const coutAuto = useMemo(() => sumLines(lines), [lines]);

  const usedPieceIds = useMemo(() => usedPieceIdsFromLines(lines), [lines]);

  const pickerCatalog = useMemo(
    () => catalog.filter((p) => !usedPieceIds.has(String(p.id))),
    [catalog, usedPieceIds]
  );

  const getPieceOptionsForLine = useCallback(
    (lineKey) =>
      catalog
        .filter((p) => {
          const id = String(p.id);
          if (usedPieceIds.has(id)) {
            const line = lines.find((l) => l.key === lineKey);
            return line?.piece_id === id;
          }
          return true;
        })
        .map((p) => ({
          value: String(p.id),
          label: p.nom,
        })),
    [catalog, lines, usedPieceIds]
  );

  const resetForm = useCallback(() => {
    setRepair(null);
    setDescription('');
    setStatut('pending');
    setDateDebut('');
    setDateFin('');
    setDatePrevueFin('');
    setLines([]);
    setPiecePickerOpen(false);
    setPickerSelectedId('');
    setLoadError(null);
    setSaveError(null);
  }, []);

  const loadRepair = useCallback(async () => {
    if (!reparationId) return;
    setLoadError(null);
    setLoading(true);
    try {
      const data = await reparationsAPI.getById(reparationId);
      const loadedLines = repairToLines(data);

      setRepair(data);
      setDescription(data.description || '');
      setStatut(data.statut || 'pending');
      setDateDebut(dateInputValue(data.date_debut));
      setDateFin(dateInputValue(data.date_fin));
      setDatePrevueFin(dateInputValue(data.date_prevue_fin));
      setLines(loadedLines);
    } catch (e) {
      setLoadError(e.message || 'Impossible de charger la réparation');
      setRepair(null);
    } finally {
      setLoading(false);
    }
  }, [reparationId]);

  useEffect(() => {
    if (isOpen && reparationId) {
      loadRepair();
    } else if (!isOpen) {
      resetForm();
    }
  }, [isOpen, reparationId, loadRepair, resetForm]);

  useEffect(() => {
    if (piecePickerOpen && pickerCatalog.length === 0) {
      setPiecePickerOpen(false);
      setPickerSelectedId('');
    }
  }, [piecePickerOpen, pickerCatalog.length]);

  const openPiecePicker = () => {
    if (pickerCatalog.length === 0) return;
    setPickerSelectedId('');
    setPiecePickerOpen(true);
  };

  const closePiecePicker = () => {
    setPiecePickerOpen(false);
    setPickerSelectedId('');
  };

  const confirmPiecePicker = () => {
    if (!pickerSelectedId || usedPieceIds.has(String(pickerSelectedId))) return;
    const pc = catalog.find((p) => String(p.id) === String(pickerSelectedId));
    if (!pc) return;
    setLines((prev) => [
      ...prev,
      {
        key: nextLineKey(),
        piece_id: String(pickerSelectedId),
        quantite: 1,
        prix_utilise: Number(pc.prix ?? 0),
      },
    ]);
    closePiecePicker();
  };

  const removeLine = (key) => {
    setLines((prev) => prev.filter((l) => l.key !== key));
  };

  const updateLine = (key, patch) => {
    if (patch.piece_id != null) {
      const duplicate = lines.some(
        (l) => l.key !== key && String(l.piece_id) === String(patch.piece_id)
      );
      if (duplicate) return;
    }
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const next = { ...l, ...patch };
        if (patch.piece_id != null && patch.prix_utilise === undefined) {
          const pc = catalog.find((p) => String(p.id) === String(patch.piece_id));
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
      setSaving(true);
      const piecesPayload = lines.map((ln) => ({
        piece_id: Number(ln.piece_id),
        quantite: Number(ln.quantite),
        prix_utilise: Number(ln.prix_utilise),
      }));
      await reparationsAPI.update(repair.id, {
        description,
        statut,
        cout: coutAuto,
        date_debut: dateDebut || null,
        date_fin: dateFin || null,
        date_prevue_fin: datePrevueFin || null,
        pieces: piecesPayload,
      });
      onSaved?.();
      onClose();
    } catch (err) {
      setSaveError(err.message || 'Enregistrement impossible');
    } finally {
      setSaving(false);
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
                ? `${[veh.marque, veh.modele].filter(Boolean).join('-') || '—'} · ${veh.immatriculation || veh.immat || '—'}`
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

          <div
            className={`rounded-xl border p-4 ${
              isDark ? 'border-white/10 bg-slate-800/40' : 'border-gray-200 bg-gray-50'
            }`}
          >
            <label className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Coût
            </label>
            <div
              className={`px-4 py-3 rounded-xl border-2 text-lg font-bold tabular-nums ${
                isDark
                  ? 'bg-slate-900/60 border-white/10 text-amber-400'
                  : 'bg-white border-gray-200 text-gray-900'
              }`}
              aria-live="polite"
            >
              {formatCurrency(coutAuto)}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <Input
              label="Date début"
              type="date"
              value={dateDebut}
              onChange={(e) => setDateDebut(e.target.value)}
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
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={openPiecePicker}
                disabled={!pickerCatalog.length}
              >
                + Ligne
              </Button>
            </div>

            {piecePickerOpen && (
              <div
                className={`mb-4 p-3 rounded-lg border ${
                  isDark ? 'border-amber-500/30 bg-slate-900/80' : 'border-amber-200 bg-amber-50'
                }`}
              >
                <p className={`text-xs font-semibold mb-2 uppercase ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  Pièces disponibles — sélectionnez une ligne puis OK
                </p>
                <ul className="space-y-1 max-h-52 overflow-y-auto mb-3">
                  {pickerCatalog.map((p) => {
                    const selected = String(pickerSelectedId) === String(p.id);
                    const outOfStock = (p.quantite ?? 0) < 1;
                    return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => !outOfStock && setPickerSelectedId(String(p.id))}
                        disabled={outOfStock}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors border-2 ${
                          outOfStock
                            ? isDark
                              ? 'opacity-40 cursor-not-allowed border-transparent text-gray-500'
                              : 'opacity-40 cursor-not-allowed border-transparent text-gray-400'
                            : selected
                              ? isDark
                                ? 'border-amber-400 bg-amber-500/20 text-white'
                                : 'border-amber-500 bg-white text-gray-900 shadow-sm'
                              : isDark
                                ? 'border-transparent hover:bg-white/10 text-gray-200'
                                : 'border-transparent hover:bg-white text-gray-800'
                        }`}
                      >
                        <span className="font-medium">{p.nom}</span>
                        <span className={`ml-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {formatCurrency(p.prix)} · stock {p.quantite ?? 0}
                        </span>
                      </button>
                    </li>
                    );
                  })}
                </ul>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" size="sm" onClick={confirmPiecePicker} disabled={!pickerSelectedId}>
                    OK
                  </Button>
                  <Button type="button" variant="outline" size="sm" onClick={closePiecePicker}>
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {!catalog.length && (
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
                  <div className="flex-1 min-w-[200px]">
                    <Select
                      label="Pièce"
                      value={ln.piece_id}
                      onChange={(e) => updateLine(ln.key, { piece_id: e.target.value })}
                      options={getPieceOptionsForLine(ln.key)}
                      required
                    />
                  </div>
                  <div className="w-32">
                    {(() => {
                      const piece = catalog.find(
                        (p) => String(p.id) === String(ln.piece_id)
                      );

                      const stock = Number(piece?.quantite ?? 0);
                      const qte = Number(ln.quantite ?? 0);
                      const left = stock - qte;

                      return (
                        <Input
                          label={`Qté (stock: ${left})`}
                          type="number"
                          min="1"
                          max={stock}
                          step="1"
                          value={String(ln.quantite)}
                          onChange={(e) =>
                            updateLine(ln.key, {
                              quantite: parseInt(e.target.value, 10) || 1,
                            })
                          }
                          required
                        />
                      );
                    })()}
                  </div>
                  <div className="w-24">
                  <Input
                  label="Prix utilisé"
                  type="number"
                  readOnly
                  tabIndex={-1}
                  value={
                    ln.prix_utilise === '' || ln.prix_utilise == null
                      ? ''
                      : String(ln.prix_utilise)
                  }
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
            <Button type="submit" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </Button>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}