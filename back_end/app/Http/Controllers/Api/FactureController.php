<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Reparation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class FactureController extends Controller
{
    public function index()
    {
        return Facture::query()
            ->with(['reparation.vehicule.client', 'user'])
            ->orderByDesc('created_at')
            ->get()
            ->map(fn (Facture $f) => $this->serializeFacture($f));
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'reparation_id' => ['required', 'exists:reparations,id', Rule::unique('factures', 'reparation_id')],
            'user_id' => ['required', 'exists:users,id'],
            'total_piece' => ['required', 'integer', 'min:0'],
            'cout' => ['required', 'numeric', 'min:0'],
            'prix_total' => ['required', 'numeric', 'min:0'],
            'statut' => ['required', 'string', 'max:255'],
            'date_validation' => ['nullable', 'date'],
        ]);

        $reparation = Reparation::query()->with('vehicule')->findOrFail($data['reparation_id']);
        if ((int) $reparation->vehicule->client_id !== (int) $data['client_id']) {
            return response()->json(['message' => 'La réparation ne correspond pas au client choisi.'], 422);
        }

        // Keep client_id in the data - it's now stored directly in the factures table
        // This allows proper retrieval even if relationships aren't eagerly loaded

        $facture = Facture::query()->create($data);

        return response()->json($this->serializeFacture($facture->load(['reparation.vehicule.client', 'user'])), 201);
    }

    public function show(Facture $facture)
    {
        return $this->serializeFacture($facture->load(['reparation.vehicule.client', 'user']));
    }

    public function update(Request $request, Facture $facture)
    {
        $data = $request->validate([
            'client_id' => ['sometimes', 'exists:clients,id'],
            'reparation_id' => ['sometimes', 'exists:reparations,id', Rule::unique('factures', 'reparation_id')->ignore($facture->id)],
            'user_id' => ['sometimes', 'exists:users,id'],
            'total_piece' => ['sometimes', 'integer', 'min:0'],
            'cout' => ['sometimes', 'numeric', 'min:0'],
            'prix_total' => ['sometimes', 'numeric', 'min:0'],
            'statut' => ['sometimes', 'string', 'max:255'],
            'date_validation' => ['sometimes', 'nullable', 'date'],
        ]);

        $facture->load('reparation.vehicule');

        if (isset($data['reparation_id']) || isset($data['client_id'])) {
            $repId = $data['reparation_id'] ?? $facture->reparation_id;
            $reparation = Reparation::query()->with('vehicule')->findOrFail($repId);
            $expectedClientId = (int) $reparation->vehicule->client_id;

            if (isset($data['client_id']) && (int) $data['client_id'] !== $expectedClientId) {
                return response()->json(['message' => 'La réparation ne correspond pas au client choisi.'], 422);
            }
        }

        // Keep client_id in the data - it's now stored directly in the factures table
        // This allows proper retrieval even if relationships aren't eagerly loaded

        $facture->update($data);

        return $this->serializeFacture($facture->fresh()->load(['reparation.vehicule.client', 'user']));
    }

    public function destroy(Facture $facture)
    {
        if ($facture->facture_pdf_path) {
            Storage::disk('public')->delete($facture->facture_pdf_path);
        }

        $facture->delete();

        return response()->json(null, 204);
    }

    public function uploadPdf(Request $request, Facture $facture)
    {
        $data = $request->validate([
            'file' => ['required', 'file', 'mimes:pdf', 'max:5120'],
        ]);

        if ($facture->facture_pdf_path) {
            Storage::disk('public')->delete($facture->facture_pdf_path);
        }

        $path = $data['file']->store('factures', 'public');
        $facture->facture_pdf_path = $path;
        $facture->save();

        return response()->json($this->serializeFacture($facture->fresh()->load(['reparation.vehicule.client', 'user'])));
    }

    private function serializeFacture(Facture $f): array
    {
        // Use direct client_id from facture (now stored in database)
        // Fall back to relationship path for older records if needed
        $clientId = $f->client_id ?? $f->reparation?->vehicule?->client_id;
        $pdfUrl = $f->facture_pdf_path
            ? url(Storage::disk('public')->url($f->facture_pdf_path))
            : null;

        return [
            'id' => $f->id,
            'total_piece' => (int) $f->total_piece,
            'cout' => (float) $f->cout,
            'prix_total' => (float) $f->prix_total,
            'date_validation' => $f->date_validation?->format('Y-m-d'),
            'statut' => $f->statut,
            'reparationId' => $f->reparation_id,
            'clientId' => $clientId,
            'userId' => $f->user_id,
            'facturePdfUrl' => $pdfUrl,
            'facturePdfPath' => $f->facture_pdf_path,
        ];
    }
}
