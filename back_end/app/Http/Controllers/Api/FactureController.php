<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Facture;
use App\Models\Reparation;
use App\Models\User;
use App\Services\ActivityLogService;
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
            'taxes' => ['nullable', 'array'],
            'taxes.*.label' => ['required_with:taxes', 'string', 'max:255'],
            'taxes.*.rate' => ['required_with:taxes', 'numeric', 'min:0'],
            'taxes.*.note' => ['nullable', 'string', 'max:500'],
            'tax_total' => ['nullable', 'numeric', 'min:0'],
            'statut' => ['required', 'string', 'max:255'],
            'date_validation' => ['nullable', 'date'],
        ]);

        $reparation = Reparation::query()->with('vehicule')->findOrFail($data['reparation_id']);
        if ((int) $reparation->vehicule->client_id !== (int) $data['client_id']) {
            return response()->json(['message' => 'La réparation ne correspond pas au client choisi.'], 422);
        }

        // Keep client_id in the data - it's now stored directly in the factures table
        // This allows proper retrieval even if relationships aren't eagerly loaded

        $data = $this->applyTaxes($data);
        $facture = Facture::query()->create($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'create', 'facture', $facture->id,
                "Création de la facture #{$facture->id}",
            );
        }

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
            'taxes' => ['sometimes', 'nullable', 'array'],
            'taxes.*.label' => ['required_with:taxes', 'string', 'max:255'],
            'taxes.*.rate' => ['required_with:taxes', 'numeric', 'min:0'],
            'taxes.*.note' => ['nullable', 'string', 'max:500'],
            'tax_total' => ['sometimes', 'nullable', 'numeric', 'min:0'],
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

        $old = $facture->toArray();
        $data = $this->applyTaxes($data);
        $facture->update($data);

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'facture', $facture->id,
                "Modification de la facture #{$facture->id}",
                $old, $facture->fresh()->toArray(),
            );
        }

        return $this->serializeFacture($facture->fresh()->load(['reparation.vehicule.client', 'user']));
    }

    public function destroy(Facture $facture)
    {
        if ($facture->facture_pdf_path) {
            Storage::disk('public')->delete($facture->facture_pdf_path);
        }

        $old = $facture->toArray();
        $facture->delete();

        if ($loggedUser = $this->loggedUser(request())) {
            ActivityLogService::log(
                $loggedUser, 'delete', 'facture', $facture->id,
                "Suppression de la facture #{$facture->id}",
                $old, null,
            );
        }

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

        if ($loggedUser = $this->loggedUser($request)) {
            ActivityLogService::log(
                $loggedUser, 'update', 'facture', $facture->id,
                "Upload du PDF pour la facture #{$facture->id}",
            );
        }

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
            'tax_total' => $f->tax_total !== null ? (float) $f->tax_total : null,
            'taxes' => $f->taxes ?? [],
            'date_validation' => $f->date_validation?->format('Y-m-d'),
            'statut' => $f->statut,
            'reparationId' => $f->reparation_id,
            'clientId' => $clientId,
            'userId' => $f->user_id,
            'facturePdfUrl' => $pdfUrl,
            'facturePdfPath' => $f->facture_pdf_path,
        ];
    }

    /**
     * @param array<string, mixed> $data
     * @return array<string, mixed>
     */
    private function loggedUser(Request $request): ?User
    {
        $id = $request->header('X-User-Id') ?? $request->input('logged_user_id');
        return $id ? User::find($id) : null;
    }

    private function applyTaxes(array $data): array
    {
        if (!array_key_exists('taxes', $data) || !array_key_exists('cout', $data)) {
            return $data;
        }

        $taxes = is_array($data['taxes']) ? $data['taxes'] : [];
        $cout = (float) ($data['cout'] ?? 0);
        $taxTotal = 0.0;

        foreach ($taxes as $tax) {
            $rate = (float) ($tax['rate'] ?? 0);
            $taxTotal += ($cout * $rate) / 100;
        }

        $data['tax_total'] = $taxTotal;
        $data['prix_total'] = $cout + $taxTotal;

        return $data;
    }
}
