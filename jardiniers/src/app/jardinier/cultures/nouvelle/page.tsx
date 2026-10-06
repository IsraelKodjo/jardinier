"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Calendar, MapPin, Sprout, TrendingUp, Maximize } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mocks des données (idéalement récupérées depuis l'API)
const mockCultures = [
  { id: "C1", name: "Tomates Rondes", maturationDays: 90 },
  { id: "C2", name: "Pommes de Terre", maturationDays: 120 },
  { id: "C3", name: "Carottes Bio", maturationDays: 70 },
  { id: "C4", name: "Oignons Jaunes", maturationDays: 100 },
];

const mockParcelles = [
  { id: "PARC-2026-001", location: "Kpalimé, Togo", surfaceMax: 2.5 },
  { id: "PARC-2026-002", location: "Sokodé, Togo", surfaceMax: 5.0 },
];

export default function PublierCulture() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    cultureId: "",
    parcelleId: "",
    surfaceUtilisee: "",
    rendementEstime: "",
    dateSemis: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateDisponibilite = () => {
    if (!formData.cultureId || !formData.dateSemis) return null;
    const culture = mockCultures.find(c => c.id === formData.cultureId);
    if (!culture) return null;

    const dateSemis = new Date(formData.dateSemis);
    const dateDispo = new Date(dateSemis);
    dateDispo.setDate(dateDispo.getDate() + culture.maturationDays);
    
    return dateDispo.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // SAUVEGARDE LOCALE
    const culture = mockCultures.find(c => c.id === formData.cultureId);
    let dateDispoRaw = formData.dateSemis;
    if (culture && formData.dateSemis) {
      const d = new Date(formData.dateSemis);
      d.setDate(d.getDate() + culture.maturationDays);
      dateDispoRaw = d.toISOString();
    }

    const newProd = {
      id: Math.floor(Math.random() * 10000),
      culture: culture?.name || "Culture Inconnue",
      parcelle: mockParcelles.find(p => p.id === formData.parcelleId)?.id || "Parcelle Inconnue",
      surfaceUtilisee: formData.surfaceUtilisee,
      rendementEstime: formData.rendementEstime,
      dateDispo: dateDispoRaw
    };
    
    const existing = JSON.parse(localStorage.getItem('mock_productions') || '[]');
    localStorage.setItem('mock_productions', JSON.stringify([newProd, ...existing]));

    // Simulation d'API
    setTimeout(() => {
      setIsLoading(false);
      router.push("/jardinier/cultures");
    }, 1500);
  };

  const selectedParcelle = mockParcelles.find(p => p.id === formData.parcelleId);
  const selectedCulture = mockCultures.find(c => c.id === formData.cultureId);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/jardinier/cultures" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Publier une culture</h1>
          <p className="text-sm text-gray-500">Déclarez une nouvelle production sur l'une de vos parcelles.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 sm:p-8 border-b border-gray-100 bg-gray-50">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Sprout className="w-5 h-5 text-green-600" />
            Détails de la production
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Ces informations permettront aux administrateurs de savoir ce que vous pouvez fournir.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            
            {/* Culture du Catalogue */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Quelle culture allez-vous produire ? *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Sprout className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="cultureId"
                  required
                  value={formData.cultureId}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-10 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                >
                  <option value="" className="text-gray-500">Sélectionnez une culture du catalogue...</option>
                  {mockCultures.map((c) => (
                    <option key={c.id} value={c.id} className="text-gray-900">{c.name} (Délai maturation: {c.maturationDays} jours)</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Parcelle */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sur quelle parcelle ? *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  name="parcelleId"
                  required
                  value={formData.parcelleId}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-10 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                >
                  <option value="" className="text-gray-500">Sélectionnez une de vos parcelles...</option>
                  {mockParcelles.map((p) => (
                    <option key={p.id} value={p.id} className="text-gray-900">{p.location} (Réf: {p.id}) - Surface max: {p.surfaceMax} Ha</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Surface */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface allouée (Hectares) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Maximize className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="surfaceUtilisee"
                  required
                  min="0.1"
                  step="0.1"
                  max={selectedParcelle?.surfaceMax}
                  value={formData.surfaceUtilisee}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  placeholder="Ex: 1.5"
                />
              </div>
              {selectedParcelle && (
                <p className="text-xs text-gray-500 mt-1">Maximum disponible : {selectedParcelle.surfaceMax} Ha</p>
              )}
            </div>

            {/* Rendement estimé */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rendement estimé (kg) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <TrendingUp className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="number"
                  name="rendementEstime"
                  required
                  min="1"
                  value={formData.rendementEstime}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  placeholder="Ex: 500"
                />
              </div>
            </div>

            {/* Date de semis */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de semis / Lancement *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="date"
                  name="dateSemis"
                  required
                  value={formData.dateSemis}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                />
              </div>
              
              {/* Alerte dynamique de date */}
              {formData.cultureId && formData.dateSemis && (
                <div className="mt-4 bg-green-50 p-4 rounded-md border border-green-100 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-green-900">Disponibilité estimée : <strong>{calculateDisponibilite()}</strong></p>
                    <p className="text-xs text-green-700 mt-1">Calculé automatiquement selon le délai de maturation de la culture ({selectedCulture?.maturationDays} jours).</p>
                  </div>
                </div>
              )}
            </div>

          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <Link
              href="/jardinier/cultures"
              className="px-6 py-2.5 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
            >
              {isLoading ? (
                <span className="animate-pulse">Publication en cours...</span>
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  Publier ma production
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
