"use client";

import { useState } from "react";
import { ArrowLeft, CheckCircle2, Calendar, Package, Plane, Sprout, ShoppingBag, MapPin, Navigation } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock des cultures avec leur délai de maturation
const cultures = [
  { id: "1", name: "Tomates Rondes", maturationDays: 90 },
  { id: "2", name: "Pommes de Terre", maturationDays: 120 },
  { id: "3", name: "Carottes Bio", maturationDays: 70 },
  { id: "4", name: "Oignons Jaunes", maturationDays: 100 },
];

export default function NouvelleCommande() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);

  // État du formulaire
  const [formData, setFormData] = useState({
    cultureId: "",
    quantite: "",
    dateLivraison: "",
    adresseLivraison: "",
    emballage: "Carton standard",
    quantiteComplementaire: "",
  });

  // Gestion des changements
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Calcul de la date de lancement
  const calculateLancement = () => {
    if (!formData.cultureId || !formData.dateLivraison) return null;
    const culture = cultures.find(c => c.id === formData.cultureId);
    if (!culture) return null;

    const livraisonDate = new Date(formData.dateLivraison);
    const lancementDate = new Date(livraisonDate);
    lancementDate.setDate(lancementDate.getDate() - culture.maturationDays);
    
    return lancementDate.toLocaleDateString('fr-FR', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const handleConfirm = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.push("/client");
    }, 1500);
  };

  const selectedCulture = cultures.find(c => c.id === formData.cultureId);

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/client" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nouvelle commande</h1>
          <p className="text-sm text-gray-500">Planifiez votre prochaine production.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* WIZARD STEPS */}
        <div className="flex border-b border-gray-100">
          <div className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors ${step === 1 ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'}`}>
            1. Saisie des besoins
          </div>
          <div className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors ${step === 2 ? 'border-green-600 text-green-600' : 'border-transparent text-gray-400'}`}>
            2. Aperçu et confirmation
          </div>
        </div>

        {/* ETAPE 1 : FORMULAIRE */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Culture */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Culture souhaitée *</label>
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
                    <option value="" className="text-gray-500">Sélectionnez une culture...</option>
                    {cultures.map((c) => (
                      <option key={c.id} value={c.id} className="text-gray-900">{c.name} (Délai : {c.maturationDays} jours)</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantité (kg) *</label>
                <input
                  type="number"
                  name="quantite"
                  required
                  min="1"
                  value={formData.quantite}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  placeholder="Ex: 500"
                />
              </div>

              {/* Quantité complémentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Qté complémentaire (optionnel)</label>
                <input
                  type="number"
                  name="quantiteComplementaire"
                  min="0"
                  value={formData.quantiteComplementaire}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  placeholder="Ex: 50"
                />
              </div>

              {/* Date de livraison */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Date de livraison souhaitée *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    name="dateLivraison"
                    required
                    value={formData.dateLivraison}
                    onChange={handleChange}
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  />
                </div>
                {formData.cultureId && formData.dateLivraison && (
                  <p className="mt-2 text-xs font-medium text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 flex items-start gap-2">
                    <span className="mt-0.5">ℹ️</span>
                    <span>
                      Avec un délai de maturation de {selectedCulture?.maturationDays} jours, la production devra être lancée au plus tard le <strong>{calculateLancement()}</strong>.
                    </span>
                  </p>
                )}
              </div>

              {/* Adresse de livraison au Togo */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse de livraison (Togo) *</label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="adresseLivraison"
                      required
                      value={formData.adresseLivraison}
                      onChange={handleChange}
                      placeholder="Ex: Lomé, Quartier Agoè..."
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                    />
                  </div>
                  <button 
                    type="button" 
                    onClick={() => setFormData({...formData, adresseLivraison: 'Lomé, Position GPS (Lat: 6.13, Lng: 1.22)'})}
                    className="px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium shrink-0"
                    title="Prendre ma position actuelle"
                  >
                    <Navigation className="w-4 h-4" />
                    <span className="hidden sm:inline">Me localiser</span>
                  </button>
                </div>
              </div>

              {/* Emballage */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Type d'emballage *</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-gray-400" />
                  </div>
                  <select
                    name="emballage"
                    required
                    value={formData.emballage}
                    onChange={handleChange}
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-10 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  >
                    <option value="Carton standard" className="text-gray-900">Carton standard</option>
                    <option value="Caisse bois" className="text-gray-900">Caisse en bois</option>
                    <option value="Filet aéré" className="text-gray-900">Filet aéré</option>
                    <option value="Vrac" className="text-gray-900">Vrac</option>
                  </select>
                </div>
              </div>

            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2"
              >
                Passer à l'aperçu
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </button>
            </div>
          </form>
        )}

        {/* ETAPE 2 : APERCU */}
        {step === 2 && (
          <div className="p-6 sm:p-8">
            <div className="bg-amber-50 border-l-4 border-amber-500 p-4 mb-6 rounded-r-md">
              <h3 className="text-lg font-bold text-amber-800">
                Ceci est l’aperçu de votre commande, Veuillez confirmer votre commande !
              </h3>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 mb-8 space-y-4">
              <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-gray-500" />
                Résumé des informations
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6">
                <div>
                  <span className="block text-sm text-gray-500">Culture</span>
                  <span className="block font-medium text-gray-900">{selectedCulture?.name}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Quantité totale</span>
                  <span className="block font-medium text-gray-900">
                    {formData.quantite} kg 
                    {formData.quantiteComplementaire && ` (+ ${formData.quantiteComplementaire} kg compl.)`}
                  </span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Adresse de livraison</span>
                  <span className="block font-medium text-gray-900">{formData.adresseLivraison}</span>
                </div>
                <div>
                  <span className="block text-sm text-gray-500">Emballage</span>
                  <span className="block font-medium text-gray-900">{formData.emballage}</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded border border-green-100 mt-4">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                  <div>
                    <span className="block text-sm text-gray-500">Date de livraison souhaitée</span>
                    <span className="block font-bold text-gray-900">{new Date(formData.dateLivraison).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="block text-sm text-green-700 font-medium">Date de lancement calculée</span>
                    <span className="block font-bold text-green-800">{calculateLancement()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <span className="animate-pulse">Enregistrement...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Confirmer votre commande !
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
