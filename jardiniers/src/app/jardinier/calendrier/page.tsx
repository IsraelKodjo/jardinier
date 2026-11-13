"use client";

import { Suspense, useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Sprout,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MapPin,
  Trash2,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  ChevronRight,
  Filter,
  Sparkles,
  ArrowRight,
  Info,
  Layers,
  Leaf,
  FlaskConical,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  getJardinierProductionsAction,
  getAllJardinierTraitementsAction,
  createTraitementAction,
  updateTraitementStatusAction,
  deleteTraitementAction,
  generatePrevisionalTraitementsAction,
} from "../actions";

// Bibliothèque de préréglages de pesticides et traitements agricoles courants
const PESTICIDE_PRESETS = [
  {
    name: "Huile de Neem (Azadirachtine)",
    type: "Bio-pesticide (Insecticide)",
    cible: "Pucerons, aleurodes (mouches blanches), thrips, acariens",
    dosage: "30 ml dans 15 L d'eau (pulvérisateur)",
    stade: "Croissance végétative",
    dar: 3,
    notes: "Application le soir ou tôt le matin. Bien mouiller le dessous des feuilles.",
  },
  {
    name: "Bouillie Bordelaise (Sulfate de cuivre)",
    type: "Fongicide minéral",
    cible: "Mildiou, alternariose, bactérioses foliaires",
    dosage: "120 g dans 10 L d'eau",
    stade: "Pré-floraison",
    dar: 5,
    notes: "Traitement protecteur préventif avant les pluies ou en période humide.",
  },
  {
    name: "Bacillus thuringiensis (Bt)",
    type: "Bio-insecticide biologique",
    cible: "Chenilles défoliatrices, noctuelles, teigne et foreuses",
    dosage: "20 g dans 10 L d'eau",
    stade: "Nouaison & Fructification",
    dar: 1,
    notes: "Inoffensif pour les abeilles et les auxiliaires. Agit par ingestion sur les chenilles.",
  },
  {
    name: "Savon noir potassique liquide",
    type: "Insecticide de contact bio",
    cible: "Pucerons, cochenilles, fumagine",
    dosage: "35 ml dans 1 L d'eau tiède (ou 350ml / 10L)",
    stade: "Levée & Enracinement",
    dar: 1,
    notes: "Asphyxie les insectes piqueurs-suceurs sans laisser de résidus toxiques.",
  },
  {
    name: "Purin d'ortie & Ail-Piment macéré",
    type: "Répulsif naturel & Biostimulant",
    cible: "Insectes du sol (taupins, vers), champignons naissants",
    dosage: "1 L pour 10 L d'eau en arrosage au pied",
    stade: "Levée & Enracinement",
    dar: 0,
    notes: "Fortifie les défenses naturelles de la plante et repousse les ravageurs.",
  },
  {
    name: "Soufre mouillable / micronisé",
    type: "Fongicide & Acaricide",
    cible: "Oïdium (blanc), acariens",
    dosage: "50 g dans 10 L d'eau",
    stade: "Croissance végétative",
    dar: 3,
    notes: "Ne pas appliquer si température supérieure à 28°C pour éviter les brûlures foliaires.",
  },
  {
    name: "Deltaméthrine / Pyréthrinoïde raisonné",
    type: "Insecticide conventionnel",
    cible: "Attaques sévères de coléoptères, noctuelles et ravageurs piqueurs",
    dosage: "15 ml dans 15 L d'eau",
    stade: "Grossissement des fruits",
    dar: 7,
    notes: "Port obligatoire de masque et gants. Respecter impérativement le délai de 7 jours.",
  },
  {
    name: "Engrais foliaire NPK + Oligo-éléments",
    type: "Fertilisant & Revitalisant foliaire",
    cible: "Carences minérales, soutien floraison et nouaison",
    dosage: "40 g dans 10 L d'eau",
    stade: "Floraison",
    dar: 0,
    notes: "Améliore le grossissement et la vigueur des plants.",
  },
];

function CalendrierContent() {
  const searchParams = useSearchParams();
  const preselectedProdId = searchParams.get("prodId");

  const [productions, setProductions] = useState<any[]>([]);
  const [traitements, setTraitements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProdId, setSelectedProdId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PLANIFIE" | "EFFECTUE">("ALL");

  // Modal création traitement
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const [modalForm, setModalForm] = useState({
    productionId: "",
    dateTraitement: new Date().toISOString().split("T")[0],
    produit: PESTICIDE_PRESETS[0].name,
    typeProduit: PESTICIDE_PRESETS[0].type,
    cible: PESTICIDE_PRESETS[0].cible,
    dosage: PESTICIDE_PRESETS[0].dosage,
    stade: PESTICIDE_PRESETS[0].stade,
    delaiAvantRecolteJours: PESTICIDE_PRESETS[0].dar,
    status: "PLANIFIE",
    notes: PESTICIDE_PRESETS[0].notes,
  });

  const loadData = async () => {
    setLoading(true);
    const [prods, trts] = await Promise.all([
      getJardinierProductionsAction(),
      getAllJardinierTraitementsAction(),
    ]);
    setProductions(prods);
    setTraitements(trts);

    if (preselectedProdId && prods.some((p) => p.id === preselectedProdId)) {
      setSelectedProdId(preselectedProdId);
    } else if (prods.length > 0 && selectedProdId === "ALL" && !preselectedProdId) {
      // Garder ALL ou première culture
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [preselectedProdId]);

  // Culture active sélectionnée
  const activeProduction =
    selectedProdId === "ALL"
      ? productions[0] || null
      : productions.find((p) => p.id === selectedProdId) || null;

  // Filtrage des traitements
  const filteredTraitements = traitements.filter((t) => {
    const matchesProd = selectedProdId === "ALL" || t.productionId === selectedProdId;
    const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
    return matchesProd && matchesStatus;
  });

  // Gestion préréglage pesticide dans le formulaire
  const handlePresetSelect = (presetName: string) => {
    const found = PESTICIDE_PRESETS.find((p) => p.name === presetName);
    if (found) {
      setModalForm((prev) => ({
        ...prev,
        produit: found.name,
        typeProduit: found.type,
        cible: found.cible,
        dosage: found.dosage,
        stade: found.stade,
        delaiAvantRecolteJours: found.dar,
        notes: found.notes,
      }));
    } else {
      setModalForm((prev) => ({
        ...prev,
        produit: presetName,
      }));
    }
  };

  // Création d'un traitement
  const handleCreateTraitement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalForm.productionId || !modalForm.dateTraitement || !modalForm.produit) {
      alert("Veuillez remplir les informations obligatoires.");
      return;
    }

    setIsSubmitting(true);
    const res = await createTraitementAction({
      productionId: modalForm.productionId,
      dateTraitement: modalForm.dateTraitement,
      produit: modalForm.produit,
      typeProduit: modalForm.typeProduit,
      cible: modalForm.cible,
      dosage: modalForm.dosage,
      stade: modalForm.stade,
      delaiAvantRecolteJours: Number(modalForm.delaiAvantRecolteJours) || 0,
      status: modalForm.status,
      notes: modalForm.notes,
    });

    if (res.success) {
      await loadData();
      setIsModalOpen(false);
    } else {
      alert(res.error || "Erreur lors de l'enregistrement.");
    }
    setIsSubmitting(false);
  };

  // Marquer comme effectué
  const handleToggleStatus = async (traitementId: string, currentStatus: string) => {
    const newStatus = currentStatus === "PLANIFIE" ? "EFFECTUE" : "PLANIFIE";
    const res = await updateTraitementStatusAction(traitementId, newStatus);
    if (res.success) {
      setTraitements((prev) =>
        prev.map((t) => (t.id === traitementId ? { ...t, status: newStatus } : t))
      );
    }
  };

  // Suppression
  const handleDeleteTraitement = async (traitementId: string) => {
    if (!confirm("Voulez-vous supprimer ce traitement du calendrier ?")) return;
    const res = await deleteTraitementAction(traitementId);
    if (res.success) {
      setTraitements((prev) => prev.filter((t) => t.id !== traitementId));
    }
  };

  // Génération automatique du programme
  const handleGenerateProgram = async (prodId: string) => {
    setIsGenerating(true);
    const res = await generatePrevisionalTraitementsAction(prodId);
    if (res.success) {
      await loadData();
    } else {
      alert(res.error || "Erreur lors de la génération.");
    }
    setIsGenerating(false);
  };

  // Calculs temporels du cycle végétatif
  const calculateCycleInfo = (prod: any) => {
    if (!prod || !prod.dateSemis || !prod.dateDispo) return null;
    const start = new Date(prod.dateSemis).getTime();
    const end = new Date(prod.dateDispo).getTime();
    const now = new Date().getTime();

    const totalDays = Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)));
    const daysElapsed = Math.max(0, Math.round((now - start) / (1000 * 60 * 60 * 24)));
    const percent = Math.min(100, Math.max(0, Math.round((daysElapsed / totalDays) * 100)));

    let currentStage = "Semis & Germination";
    if (percent > 85) currentStage = "Maturation & Récolte imminente";
    else if (percent > 65) currentStage = "Fructification & Grossissement";
    else if (percent > 45) currentStage = "Floraison & Nouaison";
    else if (percent > 20) currentStage = "Croissance végétative active";
    else if (percent > 5) currentStage = "Levée & Enracinement";

    return { totalDays, daysElapsed, percent, currentStage };
  };

  const cycleInfo = activeProduction ? calculateCycleInfo(activeProduction) : null;

  return (
    <div className="max-w-6xl mx-auto pb-16 font-sans">
      {/* En-tête */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Itinéraire technique & Protection des cultures
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-7 h-7 text-emerald-600" />
            Calendrier Cultural & Traitements
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Suivi temporel de vos cultures du semis à la récolte et planification date par date des traitements pesticides.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              if (productions.length === 0) {
                alert("Vous devez d'abord déclarer une culture.");
                return;
              }
              setModalForm((prev) => ({
                ...prev,
                productionId: selectedProdId !== "ALL" ? selectedProdId : productions[0].id,
              }));
              setIsModalOpen(true);
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-xs transition-colors flex items-center gap-2 text-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Planifier un traitement pesticide
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-xs flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Chargement du calendrier cultural et des traitements...</p>
        </div>
      ) : productions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
          <Sprout className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucune culture enregistrée</h3>
          <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">
            Pour visualiser le calendrier cultural et planifier des traitements, déclarez d'abord une culture sur l'une de vos parcelles.
          </p>
          <Link
            href="/jardinier/cultures/nouvelle"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-5 rounded-xl transition-colors inline-flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Déclarer une culture
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Barre de sélection de culture & filtres */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-gray-400" />
                Culture :
              </span>
              <select
                value={selectedProdId}
                onChange={(e) => setSelectedProdId(e.target.value)}
                className="px-3.5 py-2 bg-gray-50 border border-gray-300 rounded-xl text-sm font-semibold text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="ALL">Toutes mes cultures ({productions.length})</option>
                {productions.map((p) => (
                  <option key={p.id} value={p.id}>
                    🌱 {p.cultureName} — {p.parcelleLocation || p.parcelleId} ({p.surfaceUtilisee} Ha)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto justify-end">
              <button
                onClick={() => setStatusFilter("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "ALL"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tous ({traitements.filter((t) => selectedProdId === "ALL" || t.productionId === selectedProdId).length})
              </button>
              <button
                onClick={() => setStatusFilter("PLANIFIE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "PLANIFIE"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200"
                }`}
              >
                À venir / Planifiés
              </button>
              <button
                onClick={() => setStatusFilter("EFFECTUE")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  statusFilter === "EFFECTUE"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Effectués ✓
              </button>
            </div>
          </div>

          {/* Section 1 : Chronologie du cycle cultural (Entre le semis et la récolte) */}
          {activeProduction && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50/70 via-gray-50/40 to-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {activeProduction.image ? (
                      <img
                        src={activeProduction.image}
                        alt={activeProduction.cultureName}
                        className="w-16 h-16 rounded-2xl object-cover border border-gray-200 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                        <Sprout className="w-8 h-8" />
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-gray-900">{activeProduction.cultureName}</h2>
                        <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-200">
                          {activeProduction.surfaceUtilisee} Ha
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        Parcelle : {activeProduction.parcelleLocation || activeProduction.parcelleId}
                        <span>•</span>
                        Rendement estimé : ~{activeProduction.rendementEstime} kg
                      </p>
                    </div>
                  </div>

                  {/* Bouton générer programme si aucun traitement */}
                  {filteredTraitements.length === 0 && (
                    <button
                      onClick={() => handleGenerateProgram(activeProduction.id)}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Génération...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          Générer le calendrier conseillé (Bio)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Jauge et Timeline du cycle */}
              {cycleInfo && (
                <div className="p-6 sm:p-8 space-y-6">
                  {/* Progression globale */}
                  <div>
                    <div className="flex flex-wrap items-center justify-between text-xs mb-2 gap-2">
                      <span className="font-bold text-gray-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        Stade actuel :{" "}
                        <span className="text-emerald-700 uppercase font-extrabold">
                          {cycleInfo.currentStage}
                        </span>
                      </span>
                      <span className="font-mono text-gray-500">
                        Jour {cycleInfo.daysElapsed} sur {cycleInfo.totalDays} jours ({cycleInfo.percent}% écoulé)
                      </span>
                    </div>

                    <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex">
                      <div
                        className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${cycleInfo.percent}%` }}
                      />
                    </div>
                  </div>

                  {/* Étapes clés du calendrier agricole (Itinéraire) */}
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2">
                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">1. Semis</span>
                      <span className="text-xs font-bold text-gray-900 block mt-0.5">
                        {activeProduction.dateSemis || "Jour 0"}
                      </span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Mise en terre / pépinière</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">2. Levée</span>
                      <span className="text-xs font-bold text-gray-900 block mt-0.5">~ J+7 à J+14</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Développement racinaire</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">3. Croissance</span>
                      <span className="text-xs font-bold text-gray-900 block mt-0.5">~ J+20 à J+40</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Feuillage & vigueur</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">4. Floraison</span>
                      <span className="text-xs font-bold text-gray-900 block mt-0.5">~ J+45 à J+60</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Pollinisation & nouaison</span>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-xl border border-gray-200/70">
                      <span className="text-[10px] font-bold text-emerald-700 uppercase block">5. Fructification</span>
                      <span className="text-xs font-bold text-gray-900 block mt-0.5">~ J+65 à J+80</span>
                      <span className="text-[10px] text-gray-500 mt-1 block">Grossissement fruits</span>
                    </div>

                    <div className="p-3 bg-emerald-50/80 rounded-xl border border-emerald-200">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase block">6. Récolte</span>
                      <span className="text-xs font-bold text-emerald-950 block mt-0.5">
                        {activeProduction.dateDispo || "Maturité"}
                      </span>
                      <span className="text-[10px] text-emerald-700 mt-1 block">Cueillette & livraison</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section 2 : Programme & Calendrier des traitements pesticides date par date */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  Traitements & Pesticides programmés date par date ({filteredTraitements.length})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Interventions phytosanitaires appliquées ou prévues pour protéger la production.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  Respectez toujours le <strong>DAR (Délai Avant Récolte)</strong>.
                </span>
              </div>
            </div>

            {filteredTraitements.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-3 text-amber-600">
                  <CalendarIcon className="w-7 h-7" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Aucun traitement programmé</h4>
                <p className="text-xs text-gray-500 max-w-md mx-auto mb-5">
                  Aucun traitement phytosanitaire n'est enregistré pour cette sélection. Planifiez vos applications préventives ou curatives pour garantir une récolte saine.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setModalForm((prev) => ({
                        ...prev,
                        productionId: selectedProdId !== "ALL" ? selectedProdId : productions[0]?.id || "",
                      }));
                      setIsModalOpen(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    + Ajouter une date de traitement
                  </button>
                  {activeProduction && (
                    <button
                      onClick={() => handleGenerateProgram(activeProduction.id)}
                      disabled={isGenerating}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Générer le programme conseillé
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {filteredTraitements.map((trt) => {
                  const isDone = trt.status === "EFFECTUE";
                  const treatmentDateObj = new Date(trt.dateTraitement);
                  const isPast = treatmentDateObj.getTime() < new Date().getTime();

                  return (
                    <div
                      key={trt.id}
                      className={`p-5 sm:p-6 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        isDone ? "bg-emerald-50/20" : "hover:bg-gray-50/60"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        {/* Bouton coche rapide de statut */}
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(trt.id, trt.status)}
                          className={`mt-1 w-6 h-6 rounded-full border flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                            isDone
                              ? "bg-emerald-600 border-emerald-600 text-white"
                              : "border-gray-300 hover:border-emerald-500 text-transparent"
                          }`}
                          title={isDone ? "Marquer comme à faire" : "Marquer comme effectué"}
                        >
                          <CheckCircle2 className="w-4 h-4 fill-current" />
                        </button>

                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            {/* Date de traitement */}
                            <span className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                              <CalendarIcon className="w-3.5 h-3.5 text-gray-400" />
                              {trt.dateTraitement}
                            </span>

                            {/* Nom du produit / pesticide */}
                            <span className="text-sm font-bold text-emerald-950 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200">
                              {trt.produit}
                            </span>

                            {/* Type de produit */}
                            <span className="text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                              {trt.typeProduit || "Pesticide"}
                            </span>

                            {/* Statut badge */}
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                isDone
                                  ? "bg-emerald-100 text-emerald-800"
                                  : isPast
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-blue-100 text-blue-800"
                              }`}
                            >
                              {isDone ? "Effectué ✓" : isPast ? "En retard / À faire" : "Planifié"}
                            </span>
                          </div>

                          {/* Détails : cible, dosage, stade, DAR */}
                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 pt-0.5">
                            {trt.cultureName && selectedProdId === "ALL" && (
                              <span className="font-medium text-emerald-700">
                                🌱 Culture : {trt.cultureName}
                              </span>
                            )}
                            {trt.stade && (
                              <span>
                                Stade : <strong>{trt.stade}</strong>
                              </span>
                            )}
                            {trt.cible && (
                              <span>
                                Cible : <strong>{trt.cible}</strong>
                              </span>
                            )}
                            {trt.dosage && (
                              <span>
                                Dose : <strong>{trt.dosage}</strong>
                              </span>
                            )}
                            {trt.delaiAvantRecolteJours > 0 && (
                              <span className="inline-flex items-center gap-1 text-amber-700 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-[11px]">
                                <AlertTriangle className="w-3 h-3" />
                                DAR : {trt.delaiAvantRecolteJours} jours
                              </span>
                            )}
                          </div>

                          {trt.notes && (
                            <p className="text-xs text-gray-500 italic pt-1 leading-relaxed">
                              « {trt.notes} »
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(trt.id, trt.status)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                            isDone
                              ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs"
                          }`}
                        >
                          {isDone ? "Repasser à Planifié" : "Valider fait ✓"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTraitement(trt.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer ce traitement"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL : Planifier un traitement pesticide */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900">Planifier un Traitement Phytosanitaire</h3>
                  <p className="text-xs text-gray-500">Ajout d'une intervention pesticide à date précise</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTraitement} className="p-6 overflow-y-auto space-y-4">
              {/* Culture concernée */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Culture concernée *</label>
                <select
                  required
                  value={modalForm.productionId}
                  onChange={(e) => setModalForm({ ...modalForm, productionId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {productions.map((p) => (
                    <option key={p.id} value={p.id}>
                      🌱 {p.cultureName} — Parcelle {p.parcelleLocation || p.parcelleId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date du traitement */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Date d'application prévue *</label>
                <input
                  type="date"
                  required
                  value={modalForm.dateTraitement}
                  onChange={(e) => setModalForm({ ...modalForm, dateTraitement: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Sélecteur de préréglages recommandés */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                <span className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Préréglages de pesticides & bio-traitements
                </span>
                <select
                  onChange={(e) => handlePresetSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold text-emerald-900 outline-none"
                >
                  <option value="">Sélectionner un produit recommandé (pré-remplit les champs)...</option>
                  {PESTICIDE_PRESETS.map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} — {p.type} (DAR: {p.dar}j)
                    </option>
                  ))}
                </select>
              </div>

              {/* Nom du produit et Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Nom du produit / Pesticide *</label>
                  <input
                    type="text"
                    required
                    value={modalForm.produit}
                    onChange={(e) => setModalForm({ ...modalForm, produit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Huile de Neem"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Type d'intervention</label>
                  <select
                    value={modalForm.typeProduit}
                    onChange={(e) => setModalForm({ ...modalForm, typeProduit: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Bio-pesticide (Insecticide)">Bio-pesticide (Insecticide)</option>
                    <option value="Fongicide minéral">Fongicide minéral</option>
                    <option value="Insecticide conventionnel">Insecticide conventionnel</option>
                    <option value="Répulsif naturel & purin">Répulsif naturel & purin</option>
                    <option value="Fertilisant foliaire">Fertilisant foliaire</option>
                    <option value="Autre">Autre</option>
                  </select>
                </div>
              </div>

              {/* Cibles & Dosage */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Cibles / Maladies visées</label>
                  <input
                    type="text"
                    value={modalForm.cible}
                    onChange={(e) => setModalForm({ ...modalForm, cible: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: Pucerons, mildiou"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Dosage / Dilution</label>
                  <input
                    type="text"
                    value={modalForm.dosage}
                    onChange={(e) => setModalForm({ ...modalForm, dosage: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Ex: 30ml / 15L d'eau"
                  />
                </div>
              </div>

              {/* Stade & DAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Stade phénologique</label>
                  <select
                    value={modalForm.stade}
                    onChange={(e) => setModalForm({ ...modalForm, stade: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Semis & Germination">Semis & Germination</option>
                    <option value="Levée & Enracinement">Levée & Enracinement</option>
                    <option value="Croissance végétative">Croissance végétative</option>
                    <option value="Pré-floraison">Pré-floraison</option>
                    <option value="Floraison">Floraison</option>
                    <option value="Nouaison & Fructification">Nouaison & Fructification</option>
                    <option value="Grossissement des fruits">Grossissement des fruits</option>
                    <option value="Maturation">Maturation</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Délai Avant Récolte (DAR en jours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={modalForm.delaiAvantRecolteJours}
                    onChange={(e) =>
                      setModalForm({
                        ...modalForm,
                        delaiAvantRecolteJours: Number(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Statut initial */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Statut initial</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="PLANIFIE"
                      checked={modalForm.status === "PLANIFIE"}
                      onChange={() => setModalForm({ ...modalForm, status: "PLANIFIE" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Planifié (À réaliser à cette date)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-gray-800 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="EFFECTUE"
                      checked={modalForm.status === "EFFECTUE"}
                      onChange={() => setModalForm({ ...modalForm, status: "EFFECTUE" })}
                      className="text-emerald-600 focus:ring-emerald-500"
                    />
                    Déjà effectué aujourd'hui
                  </label>
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">Instructions & Remarques</label>
                <textarea
                  rows={2}
                  value={modalForm.notes}
                  onChange={(e) => setModalForm({ ...modalForm, notes: e.target.value })}
                  className="w-full px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs text-gray-900 outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Ex: Pulvériser le soir à la fraîche en évitant les périodes de pluie..."
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 px-5 rounded-xl text-xs shadow-xs transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Enregistrer dans le calendrier
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CalendrierPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto py-16 text-center">
          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Chargement du calendrier...</p>
        </div>
      }
    >
      <CalendrierContent />
    </Suspense>
  );
}
