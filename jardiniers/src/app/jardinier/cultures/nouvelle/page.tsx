"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle2, Calendar, MapPin, Sprout, TrendingUp, Maximize, Loader2, Camera, X, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  getCatalogueCulturesForJardinierAction,
  getJardinierParcellesAction,
  createProductionAction,
} from "../../actions";

export default function PublierCulture() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [culturesList, setCulturesList] = useState<any[]>([]);
  const [parcellesList, setParcellesList] = useState<any[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [customImage, setCustomImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
        setFormData((prev) => ({ ...prev, parcelleId: parcs[0].id }));
      }
      setPageLoading(false);
    }
    loadData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedCulture = culturesList.find((c) => c.id === formData.cultureId);
  const selectedParcelle = parcellesList.find((p) => p.id === formData.parcelleId);

  const activeImage = customImage || selectedCulture?.image || null;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });

      const result = await res.json();
      if (result.url) {
        setCustomImage(result.url);
      } else {
        alert(result.error || "Erreur lors du téléversement de l'image.");
      }
    } catch (err) {
      alert("Impossible d'envoyer l'image.");
    } finally {
      setIsUploading(false);
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

    if (res.success) {
      router.push("/jardinier/cultures");
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
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Publier une Production</h1>
          <p className="text-sm text-gray-500">
            Enregistrez les cultures réelles que vous produisez sur vos parcelles.
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
              Détails de la production
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Les données seront enregistrées en base et permettront aux clients de commander vos récoltes.
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
                      {c.name} — Maturation : {c.maturationDays} jours ({c.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Parcelle */}
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
                      {p.location} (Réf : {p.id}) — Surface totale : {p.surface} Ha
                    </option>
                  ))}
                </select>
              </div>

              {/* Surface allouée */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Surface allouée (Hectares) *
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
                    placeholder="Ex: 1.5"
                  />
                </div>
              </div>

              {/* Rendement estimé */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Rendement estimé (kg) *
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

              {/* Date de semis */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Date de semis / Lancement *
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
                  <div className="mt-4 bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        Disponibilité prévue : <strong>{calculateDisponibilite()}</strong>
                      </p>
                      <p className="text-xs text-emerald-700 mt-0.5">
                        Calculé automatiquement d'après la durée de cycle de la variété ({selectedCulture?.maturationDays} jours).
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Photo de la production */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Photo de la production / parcelle
                </label>
                <div className="p-4 rounded-2xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row items-center gap-5">
                  {/* Prévisualisation */}
                  <div className="relative w-28 h-28 rounded-xl overflow-hidden bg-white border border-gray-200 shadow-xs shrink-0 flex items-center justify-center">
                    {activeImage ? (
                      <img
                        src={activeImage}
                        alt="Aperçu production"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400 p-2 text-center">
                        <Camera className="w-7 h-7 mb-1 text-gray-400" />
                        <span className="text-[10px]">Aucune photo</span>
                      </div>
                    )}
                    {customImage && (
                      <button
                        type="button"
                        onClick={() => setCustomImage(null)}
                        className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 shadow-sm transition-colors cursor-pointer"
                        title="Supprimer la photo personnalisée"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Actions & info */}
                  <div className="flex-1 text-center sm:text-left space-y-2">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                      <label className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 hover:border-green-600 hover:text-green-700 text-gray-700 text-xs font-semibold rounded-xl cursor-pointer shadow-xs transition-all">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                            <span>Téléversement...</span>
                          </>
                        ) : (
                          <>
                            <Camera className="w-4 h-4 text-green-600" />
                            <span>{customImage ? "Changer la photo" : "Prendre / Ajouter une photo"}</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          disabled={isUploading}
                          onChange={handleImageUpload}
                        />
                      </label>

                      {customImage && (
                        <button
                          type="button"
                          onClick={() => setCustomImage(null)}
                          className="px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                        >
                          Rétablir l'image catalogue
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-500 leading-relaxed">
                      {customImage ? (
                        <span className="text-emerald-700 font-medium">
                          ✓ Votre photo réelle a été téléchargée avec succès et sera associée à cette production.
                        </span>
                      ) : selectedCulture?.image ? (
                        <span>
                          Photo standard issue du catalogue. Vous pouvez prendre une photo de vos plants sur le terrain pour la remplacer.
                        </span>
                      ) : (
                        <span>
                          Prenez une photo de vos semis, plants ou de la parcelle depuis votre smartphone ou PC.
                        </span>
                      )}
                    </p>
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
                    Publication en cours...
                  </>
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
      )}
    </div>
  );
}
