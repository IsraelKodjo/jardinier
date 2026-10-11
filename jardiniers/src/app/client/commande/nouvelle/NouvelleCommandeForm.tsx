"use client";

import { useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  Package,
  Sprout,
  ShoppingBag,
  MapPin,
  Navigation,
  AlertTriangle,
  X,
  Loader2,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createCommandeAction } from "../actions";

interface CultureItem {
  id: string;
  name: string;
  maturationDays: number;
}

export default function NouvelleCommandeForm({
  cultures,
  defaultCultureName,
}: {
  cultures: CultureItem[];
  defaultCultureName?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // États pour la géolocalisation
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Recherche de la culture par défaut si passée via l'URL
  const initialCulture = cultures.find(
    (c) => c.name.toLowerCase() === defaultCultureName?.toLowerCase()
  );

  // État du formulaire
  const [formData, setFormData] = useState({
    cultureId: initialCulture?.id || (cultures.length > 0 ? cultures[0].id : ""),
    quantite: "",
    dateLivraison: "",
    adresseLivraison: "",
    emballage: "Carton standard",
    quantiteComplementaire: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateLancement = () => {
    if (!formData.cultureId || !formData.dateLivraison) return null;
    const culture = cultures.find((c) => c.id === formData.cultureId);
    if (!culture) return null;

    const livraisonDate = new Date(formData.dateLivraison);
    const lancementDate = new Date(livraisonDate);
    lancementDate.setDate(lancementDate.getDate() - culture.maturationDays);

    return lancementDate.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Détection GPS réelle et Reverse Geocoding
  const handleConfirmGPSLocation = () => {
    setIsLocationModalOpen(false);

    if (!navigator.geolocation) {
      alert("La géolocalisation n'est pas prise en charge par votre navigateur.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setGpsCoords({ lat, lng });

        try {
          // Appel OpenStreetMap Nominatim pour obtenir le quartier et la ville
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "fr",
              },
            }
          );

          if (response.ok) {
            const data = await response.json();
            const addr = data.address || {};
            const quartier =
              addr.neighbourhood ||
              addr.suburb ||
              addr.quarter ||
              addr.residential ||
              addr.city_district ||
              addr.village ||
              addr.town ||
              addr.city ||
              "Quartier détecté";
            const ville = addr.city || addr.town || addr.municipality || addr.state || "";
            const precisionRue = addr.road ? `${addr.road}, ` : "";
            const nomLieu = ville ? `${precisionRue}${quartier}, ${ville}` : `${precisionRue}${quartier}`;

            const fullAddress = `${nomLieu} (GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)})`;
            setFormData((prev) => ({ ...prev, adresseLivraison: fullAddress }));
          } else {
            // Fallback si l'API inverse échoue
            const fallbackAddress = `Position détectée (GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)})`;
            setFormData((prev) => ({ ...prev, adresseLivraison: fallbackAddress }));
          }
        } catch (fetchErr) {
          const fallbackAddress = `Position détectée (GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)})`;
          setFormData((prev) => ({ ...prev, adresseLivraison: fallbackAddress }));
        } finally {
          setIsLocating(false);
        }
      },
      (geoError) => {
        setIsLocating(false);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          alert("Vous avez refusé l'accès à la localisation. Veuillez saisir votre adresse manuellement.");
        } else {
          alert("Impossible d'obtenir vos coordonnées GPS. Veuillez vérifier vos paramètres ou saisir l'adresse à la main.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
  };

  const selectedCulture = cultures.find((c) => c.id === formData.cultureId);

  const handleConfirm = async () => {
    if (!selectedCulture) return;
    setIsLoading(true);
    setError(null);

    try {
      await createCommandeAction({
        cultureId: selectedCulture.id,
        cultureName: selectedCulture.name,
        quantite: parseInt(formData.quantite, 10),
        dateLivraison: formData.dateLivraison,
        adresseLivraison: formData.adresseLivraison,
        emballage: formData.emballage,
        dateLancement: calculateLancement() || undefined,
        quantiteComplementaire: formData.quantiteComplementaire || undefined,
      });

      router.push("/client/commandes");
    } catch (err: any) {
      setError(err?.message || "Erreur lors de la création de la commande.");
      setIsLoading(false);
    }
  };

  // Extraction éventuelle des coordonnées pour le lien Google Maps
  const extractCoords = () => {
    if (gpsCoords) return gpsCoords;
    const match = formData.adresseLivraison.match(/GPS:\s*([-0-9.]+),\s*([-0-9.]+)/);
    if (match) {
      return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }
    return null;
  };

  const currentCoords = extractCoords();

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/client/commandes"
          className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
        >
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
          <div
            className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors ${
              step === 1 ? "border-green-600 text-green-600" : "border-transparent text-gray-400"
            }`}
          >
            1. Saisie des besoins
          </div>
          <div
            className={`flex-1 py-4 text-center text-sm font-medium border-b-2 transition-colors ${
              step === 2 ? "border-green-600 text-green-600" : "border-transparent text-gray-400"
            }`}
          >
            2. Aperçu et confirmation
          </div>
        </div>

        {error && (
          <div className="m-6 p-4 bg-red-50 text-red-700 rounded-md border border-red-200 text-sm">
            {error}
          </div>
        )}

        {/* ETAPE 1 : FORMULAIRE */}
        {step === 1 && (
          <form onSubmit={handleNextStep} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Culture */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Culture souhaitée *
                </label>
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
                    <option value="" className="text-gray-500">
                      Sélectionnez une culture...
                    </option>
                    {cultures.map((c) => (
                      <option key={c.id} value={c.id} className="text-gray-900">
                        {c.name} (Délai : {c.maturationDays} jours)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Quantité */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité (kg) *
                </label>
                <input
                  type="number"
                  name="quantite"
                  required
                  min="1"
                  value={formData.quantite}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Ex: 500"
                />
              </div>

              {/* Quantité complémentaire */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Qté complémentaire (optionnel)
                </label>
                <input
                  type="number"
                  name="quantiteComplementaire"
                  min="0"
                  value={formData.quantiteComplementaire}
                  onChange={handleChange}
                  className="focus:ring-green-500 focus:border-green-500 block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900 placeholder:text-gray-400"
                  placeholder="Ex: 50"
                />
              </div>

              {/* Date de livraison */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison souhaitée *
                </label>
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
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              {/* Adresse de livraison avec géolocalisation */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Adresse de livraison *
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="adresseLivraison"
                      required
                      value={formData.adresseLivraison}
                      onChange={handleChange}
                      className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900 placeholder:text-gray-400"
                      placeholder="Ex: Lomé, Quartier Agoè..."
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    disabled={isLocating}
                    className="px-3.5 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100 transition-colors flex items-center gap-2 text-sm font-medium shrink-0 cursor-pointer disabled:opacity-50"
                    title="Prendre ma position actuelle avec GPS"
                  >
                    {isLocating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        <span className="hidden sm:inline">Localisation...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="w-4 h-4" />
                        <span className="hidden sm:inline">Me localiser</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Badge de précision GPS Google Maps */}
                {currentCoords && (
                  <div className="mt-2.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        Coordonnées précises capturées :{" "}
                        <strong className="font-mono">
                          {currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}
                        </strong>
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-900 underline ml-2 shrink-0"
                    >
                      <span>Vérifier sur Google Maps</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>

              {/* Emballage */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'emballage *
                </label>
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
                    <option value="Carton standard" className="text-gray-900">
                      Carton standard
                    </option>
                    <option value="Caisse bois" className="text-gray-900">
                      Caisse en bois
                    </option>
                    <option value="Filet aéré" className="text-gray-900">
                      Filet aéré
                    </option>
                    <option value="Vrac" className="text-gray-900">
                      Vrac
                    </option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end">
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
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
                    {formData.quantite} kg{" "}
                    {formData.quantiteComplementaire &&
                      ` (+ ${formData.quantiteComplementaire} kg compl.)`}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="block text-sm text-gray-500">Adresse de livraison</span>
                  <span className="block font-medium text-gray-900">
                    {formData.adresseLivraison}
                  </span>
                  {currentCoords && (
                    <a
                      href={`https://www.google.com/maps?q=${currentCoords.lat},${currentCoords.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 hover:underline font-semibold mt-1.5"
                    >
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                      <span>Visualiser le point de livraison exact sur Google Maps</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
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
                    <span className="block font-bold text-gray-900">
                      {new Date(formData.dateLivraison).toLocaleDateString("fr-FR")}
                    </span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="block text-sm text-green-700 font-medium">
                      Date de lancement calculée
                    </span>
                    <span className="block font-bold text-green-800">
                      {calculateLancement()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 border border-gray-300 bg-white text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors cursor-pointer"
                disabled={isLoading}
              >
                Modifier
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isLoading}
                className="px-6 py-3 bg-green-600 text-white font-bold rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <span className="animate-pulse">Enregistrement en base de données...</span>
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

      {/* POP-UP / MODALE DE VIGILANCE LOCALISATION */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsLocationModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icône d'alerte */}
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-gray-900 mb-2">
              Êtes-vous sur le lieu exact de livraison ?
            </h3>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              La géolocalisation va capturer vos <strong>coordonnées GPS actuelles</strong> précises pour guider les livreurs sur <strong>Google Maps</strong>.
            </p>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 mb-6">
              ⚠️ <strong>Point de vigilance :</strong> Si vous remplissez ce formulaire alors que vous êtes actuellement à l’église, au bureau ou en déplacement, <strong>ne cliquez pas sur "Oui"</strong>. Saisissez plutôt votre adresse de livraison habituelle à la main.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(false)}
                className="w-full sm:w-auto px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Non, je saisis à la main
              </button>
              <button
                type="button"
                onClick={handleConfirmGPSLocation}
                className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <Navigation className="w-4 h-4" />
                Oui, je suis sur place
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
