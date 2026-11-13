"use client";

import { Suspense, useState, useEffect } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Calendar,
  MapPin,
  Sprout,
  TrendingUp,
  Maximize,
  Loader2,
  Camera,
  X,
  Image as ImageIcon,
  Sparkles,
  Layers,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getCatalogueCulturesForJardinierAction,
  getJardinierParcellesAction,
  createProductionAction,
  generatePrevisionalTraitementsAction,
} from "../../actions";

// Compression et conversion ultra-rapide côté client (résolution HD optimisée)
function compressImage(file: File, maxWidth = 1000, maxHeight = 1000, quality = 0.75): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

function PublierCultureContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedParcelleId = searchParams.get("parcelleId");

  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [culturesList, setCulturesList] = useState<any[]>([]);
  const [parcellesList, setParcellesList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Gestion de la photo
  const [customImage, setCustomImage] = useState<string | null>(null);
  const [useCatalogFallback, setUseCatalogFallback] = useState(false);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // Option de génération du calendrier des pesticides
  const [autoGenerateTraitements, setAutoGenerateTraitements] = useState(true);

  const [formData, setFormData] = useState({
    cultureId: "",
    parcelleId: "",
    surfaceUtilisee: "1.0",
    rendementEstime: "500",
    dateSemis: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    async function loadData() {
      setPageLoading(true);
      const [cults, parcs] = await Promise.all([
        getCatalogueCulturesForJardinierAction(),
        getJardinierParcellesAction(),
      ]);
      setCulturesList(cults);
      setParcellesList(parcs);

      if (cults.length > 0) {
        setFormData((prev) => ({ ...prev, cultureId: cults[0].id }));
      }

      if (parcs.length > 0) {
        const found = preselectedParcelleId && parcs.find((p) => p.id === preselectedParcelleId);
        const targetParc = found || parcs[0];
        setFormData((prev) => ({
          ...prev,
          parcelleId: targetParc.id,
          surfaceUtilisee:
            targetParc.remainingSurface !== undefined && targetParc.remainingSurface > 0
              ? String(targetParc.remainingSurface)
              : prev.surfaceUtilisee,
        }));
      }
      setPageLoading(false);
    }
    loadData();
  }, [preselectedParcelleId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedCulture = culturesList.find((c) => c.id === formData.cultureId);
  const selectedParcelle = parcellesList.find((p) => p.id === formData.parcelleId);

  // L'image active : soit la photo uploadée par l'utilisateur, soit l'image du catalogue si expressément cochée
  const activeImage = customImage ? customImage : useCatalogFallback ? selectedCulture?.image : null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessingImage(true);
    try {
      // 1. Compression et affichage IMMÉDIAT côté navigateur (0 seconde d'attente)
      const dataUrl = await compressImage(file);
      setCustomImage(dataUrl);
      setUseCatalogFallback(false);

      // 2. Tentative d'upload en arrière-plan vers /api/upload si disponible
      try {
        const formDataUpload = new FormData();
        formDataUpload.append("file", file);
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formDataUpload,
        });
        if (res.ok) {
          const result = await res.json();
          if (result.url) {
            setCustomImage(result.url);
          }
        }
      } catch (uploadErr) {
        console.warn("Upload serveur indisponible, conservation de l'image locale :", uploadErr);
      }
    } catch (err) {
      console.error("Erreur traitement image :", err);
      alert("Impossible de charger cette image.");
    } finally {
      setIsProcessingImage(false);
    }
  };

  const calculateDisponibilite = () => {
    if (!selectedCulture || !formData.dateSemis) return null;
    const dateSemis = new Date(formData.dateSemis);
    const dateDispo = new Date(dateSemis);
    dateDispo.setDate(dateDispo.getDate() + (selectedCulture.maturationDays || 90));

    return dateDispo.toLocaleDateString("fr-FR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cultureId || !formData.parcelleId) {
      setErrorMessage("Veuillez sélectionner une culture et une parcelle.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    let dateDispoFormatted = "";
    if (selectedCulture && formData.dateSemis) {
      const d = new Date(formData.dateSemis);
      d.setDate(d.getDate() + (selectedCulture.maturationDays || 90));
      dateDispoFormatted = d.toISOString().split("T")[0];
    }

    const res = await createProductionAction({
      parcelleId: formData.parcelleId,
      cultureId: formData.cultureId,
      cultureName: selectedCulture?.name || "Culture",
      surfaceUtilisee: formData.surfaceUtilisee,
      rendementEstime: Number(formData.rendementEstime) || 0,
      dateSemis: formData.dateSemis,
      dateDispo: dateDispoFormatted,
      image: activeImage || undefined,
    });

    if (res.success && res.productionId) {
      if (autoGenerateTraitements) {
        await generatePrevisionalTraitementsAction(res.productionId);
      }
      router.push(`/jardinier/calendrier?prodId=${res.productionId}`);
      router.refresh();
    } else {
      setErrorMessage(res.error || "Impossible d'enregistrer la production.");
      setIsLoading(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center">
        <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
        <p className="text-gray-500 text-sm">Chargement des cultures et de vos parcelles...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12 font-sans">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/jardinier/cultures"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Déclarer une Culture sur Parcelle</h1>
          <p className="text-sm text-gray-500">
            Associez une culture à une parcelle et générez son calendrier de traitements phytosanitaires.
          </p>
        </div>
      </div>

      {parcellesList.length === 0 ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <MapPin className="w-12 h-12 text-amber-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Vous devez d'abord déclarer une parcelle</h3>
          <p className="text-gray-600 text-sm max-w-md mx-auto mb-6">
            Pour publier une culture, vous devez avoir au moins une parcelle de terrain enregistrée dans votre compte.
          </p>
          <Link
            href="/jardinier/parcelle/nouvelle"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors inline-flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Déclarer une parcelle maintenant
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Sprout className="w-5 h-5 text-green-600" />
              Détails de la culture & calendrier cultural
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Vous pouvez implanter plusieurs cultures sur une même parcelle selon vos disponibilités de terrain.
            </p>
          </div>

          {errorMessage && (
            <div className="m-6 mb-0 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Culture du catalogue */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Culture agricole (Catalogue officiel) *
                </label>
                <select
                  name="cultureId"
                  required
                  value={formData.cultureId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
                >
                  {culturesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — Cycle : {c.maturationDays} jours ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parcelle d'implantation */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Parcelle d'implantation *
                </label>
                <select
                  name="parcelleId"
                  required
                  value={formData.parcelleId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
                >
                  {parcellesList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.location} (Réf : {p.id}) — Total : {p.surface} Ha{" "}
                      {p.remainingSurface !== undefined ? `• Libre : ${p.remainingSurface} Ha` : ""}
                    </option>
                  ))}
                </select>

                {/* Détail multi-cultures sur la même parcelle */}
                {selectedParcelle && (
                  <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200/70 rounded-xl text-xs space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold text-blue-900 flex items-center gap-1.5">
                        <Layers className="w-4 h-4 text-blue-600" />
                        Multi-cultures sur la parcelle « {selectedParcelle.location} »
                      </span>
                      <span className="font-mono text-blue-800 bg-white px-2 py-0.5 rounded border border-blue-200">
                        Surface totale : {selectedParcelle.surface} Ha | Disponible :{" "}
                        {selectedParcelle.remainingSurface ?? selectedParcelle.surface} Ha
                      </span>
                    </div>

                    {selectedParcelle.productions && selectedParcelle.productions.length > 0 ? (
                      <div>
                        <p className="text-gray-600 mb-1">
                          Cultures déjà installées sur ce même terrain ({selectedParcelle.productions.length}) :
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedParcelle.productions.map((pr: any) => (
                            <span
                              key={pr.id}
                              className="bg-white text-gray-800 border border-gray-200 px-2 py-0.5 rounded-md font-medium"
                            >
                              🌱 {pr.cultureName} ({pr.surfaceUtilisee} Ha)
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-blue-700">
                        Cette parcelle est entièrement disponible. Vous pouvez y associer plusieurs cultures différentes.
                      </p>
                    )}

                    {selectedParcelle.remainingSurface !== undefined && selectedParcelle.remainingSurface > 0 && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            surfaceUtilisee: String(selectedParcelle.remainingSurface),
                          }))
                        }
                        className="text-emerald-700 font-semibold hover:underline inline-block pt-1 cursor-pointer"
                      >
                        → Allouer toute la surface disponible restante ({selectedParcelle.remainingSurface} Ha)
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Surface allouée */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Surface allouée à cette culture (Hectares) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Maximize className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    name="surfaceUtilisee"
                    required
                    min="0.1"
                    step="0.1"
                    value={formData.surfaceUtilisee}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
                    placeholder="Ex: 0.8"
                  />
                </div>
              </div>

              {/* Rendement estimé */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rendement total estimé (kg) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <input
                    type="number"
                    name="rendementEstime"
                    required
                    min="1"
                    value={formData.rendementEstime}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
                    placeholder="Ex: 500"
                  />
                </div>
              </div>

              {/* Date de semis & Calcul calendrier */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date de semis / Lancement de la graine *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <input
                    type="date"
                    name="dateSemis"
                    required
                    value={formData.dateSemis}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
                  />
                </div>

                {calculateDisponibilite() && (
                  <div className="mt-3.5 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Date de récolte estimée : <strong>{calculateDisponibilite()}</strong>
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Cycle complet de {selectedCulture?.maturationDays || 90} jours entre le semis et la maturité.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Générateur de calendrier & traitements pesticides */}
              <div className="sm:col-span-2 bg-gradient-to-r from-emerald-50 to-green-50 p-4 rounded-2xl border border-emerald-200">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateTraitements}
                    onChange={(e) => setAutoGenerateTraitements(e.target.checked)}
                    className="mt-1 h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                  />
                  <div>
                    <span className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Générer automatiquement le calendrier des traitements & pesticides
                    </span>
                    <p className="text-xs text-emerald-800 mt-1 leading-relaxed">
                      Planifie automatiquement les interventions phytosanitaires date par date entre le semis et la récolte (traitements biologiques conseillés : Huile de Neem, Bouillie bordelaise, Bacillus thuringiensis, etc.). Vous pourrez personnaliser chaque traitement sur le calendrier.
                    </p>
                  </div>
                </label>
              </div>

              {/* Photo de la production */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Photo de votre production ou de votre parcelle
                </label>

                <div className="p-5 rounded-2xl border border-gray-200 bg-gray-50/70 space-y-4">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {/* Cadre Prévisualisation */}
                    <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-xs shrink-0 flex items-center justify-center">
                      {activeImage ? (
                        <img
                          src={activeImage}
                          alt="Aperçu production"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex flex-col items-center justify-center text-gray-400 p-3 text-center">
                          <Camera className="w-8 h-8 mb-1.5 text-gray-300" />
                          <span className="text-[11px] text-gray-400 leading-tight">Aucune photo</span>
                        </div>
                      )}

                      {customImage && (
                        <button
                          type="button"
                          onClick={() => setCustomImage(null)}
                          className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white rounded-full p-1.5 shadow-sm transition-colors cursor-pointer"
                          title="Supprimer la photo"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    {/* Zone de sélection */}
                    <div className="flex-1 text-center sm:text-left space-y-2.5">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                        <label className="inline-flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-colors">
                          {isProcessingImage ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Chargement de la photo...</span>
                            </>
                          ) : (
                            <>
                              <Camera className="w-4 h-4" />
                              <span>
                                {customImage
                                  ? "Changer la photo de mon appareil"
                                  : "Choisir une photo depuis mon appareil"}
                              </span>
                            </>
                          )}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={isProcessingImage}
                            onChange={handleImageUpload}
                          />
                        </label>

                        {customImage && (
                          <button
                            type="button"
                            onClick={() => setCustomImage(null)}
                            className="px-3.5 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          >
                            Supprimer ma photo
                          </button>
                        )}
                      </div>

                      {customImage ? (
                        <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Photo réelle chargée avec succès depuis votre appareil.</span>
                        </div>
                      ) : useCatalogFallback ? (
                        <div className="flex items-center gap-2 text-xs text-blue-700 font-medium">
                          <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                          <span>Illustration du catalogue ({selectedCulture?.name}) sélectionnée.</span>
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500">
                          Prenez une photo de vos plants sur le terrain ou sélectionnez un fichier depuis votre téléphone ou ordinateur.
                        </p>
                      )}

                      {/* Option alternative : utiliser l'image du catalogue si disponible */}
                      {!customImage && selectedCulture?.image && (
                        <div className="pt-2 border-t border-gray-200">
                          <button
                            type="button"
                            onClick={() => setUseCatalogFallback(!useCatalogFallback)}
                            className="text-xs text-emerald-700 hover:text-emerald-800 font-medium hover:underline inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            {useCatalogFallback
                              ? "Ne pas utiliser l'illustration du catalogue"
                              : `Ou utiliser l'image d'illustration du catalogue (${selectedCulture.name})`}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              <Link
                href="/jardinier/cultures"
                className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <Sprout className="w-4 h-4" />
                    Valider et ouvrir le calendrier
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function PublierCulture() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto py-16 text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chargement...</p>
        </div>
      }
    >
      <PublierCultureContent />
    </Suspense>
  );
}
