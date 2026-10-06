"use client";

import { useState } from "react";
import { ArrowLeft, ShieldCheck, QrCode, Search, FileText, CheckCircle2, ShieldAlert } from "lucide-react";
import Link from "next/link";

type Step = "SELECT" | "TREATMENT_FORM" | "QR_CODE";

export default function Tracabilite() {
  const [step, setStep] = useState<Step>("SELECT");
  const [isSecondValidation, setIsSecondValidation] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSelectProduction = () => {
    setStep("TREATMENT_FORM");
  };

  const handleSubmitTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      if (isSecondValidation) {
        setStep("QR_CODE");
      } else {
        // Simuler qu'on a fait la première validation, on retourne à la sélection ou on propose la seconde
        setIsSecondValidation(true);
        alert("Première attestation enregistrée. La production nécessite maintenant une seconde validation.");
        setStep("SELECT");
      }
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/controleur" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Traçabilité & Contrôle</h1>
          <p className="text-sm text-gray-500">Espace réservé aux contrôleurs phytopharmaceutiques</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden min-h-[500px]">
        {/* ETAPE 1 : SELECTION */}
        {step === "SELECT" && (
          <div>
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-gray-500" />
                Sélectionner une production à inspecter
              </h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Production 1 (En attente de 1ère attestation) */}
                <div className="border border-gray-200 rounded-lg p-5 hover:border-green-500 transition-colors cursor-pointer group" onClick={handleSelectProduction}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Parcelle : PARC-2026-X8Y9
                    </span>
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded">
                      0 / 2 Attestations
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700">Tomates Rondes</h3>
                  <p className="text-sm text-gray-500 mt-1">Semis : 01 Sept 2026 • Jardinier : Jean D.</p>
                  <button className="mt-4 w-full bg-white border border-gray-300 text-gray-700 py-2 rounded-md text-sm font-medium group-hover:bg-green-50 group-hover:border-green-300 transition-colors">
                    Démarrer le contrôle
                  </button>
                </div>

                {/* Production 2 (En attente de 2ème attestation) */}
                <div className="border border-green-200 bg-green-50/30 rounded-lg p-5 hover:border-green-500 transition-colors cursor-pointer group" onClick={() => { setIsSecondValidation(true); setStep("TREATMENT_FORM"); }}>
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-0.5 rounded uppercase tracking-wider">
                      Parcelle : PARC-2026-A1B2
                    </span>
                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2.5 py-0.5 rounded">
                      1 / 2 Attestations
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700">Pommes de Terre</h3>
                  <p className="text-sm text-gray-500 mt-1">Semis : 15 Août 2026 • Jardinier : Marie L.</p>
                  <button className="mt-4 w-full bg-green-600 border border-green-600 text-white py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors">
                    Effectuer la seconde attestation
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ETAPE 2 : FORMULAIRE DE TRAITEMENT */}
        {step === "TREATMENT_FORM" && (
          <div>
            <div className="p-6 border-b border-gray-100 bg-amber-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5" />
                {isSecondValidation ? "Seconde Attestation Phytosanitaire" : "Première Attestation Phytosanitaire"}
              </h2>
              <span className="text-sm font-bold text-amber-700">PARC-2026-A1B2</span>
            </div>
            
            <form onSubmit={handleSubmitTreatment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pesticide utilisé *</label>
                  <select required className="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none focus:ring-green-500 focus:border-green-500 bg-white">
                    <option value="">Sélectionner dans la base...</option>
                    <option value="bio">Fongicide Bio-Protect (Autorisé)</option>
                    <option value="insect">Insecticide Agro-Safe (Autorisé)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Référence du produit *</label>
                  <input type="text" required placeholder="Ex: FR-2026-99" className="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none focus:ring-green-500 focus:border-green-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de fabrication *</label>
                  <input type="date" required className="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none focus:ring-green-500 focus:border-green-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de péremption *</label>
                  <input type="date" required className="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none focus:ring-green-500 focus:border-green-500" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Délai avant consommation (DAR) en jours *</label>
                  <input type="number" required min="0" placeholder="Ex: 14" className="block w-full py-2.5 px-3 sm:text-sm border-gray-300 rounded-md border outline-none focus:ring-green-500 focus:border-green-500" />
                  <p className="mt-1 text-xs text-gray-500">Délai minimum légal à respecter entre le dernier traitement et la récolte.</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-100 flex justify-between">
                <button type="button" onClick={() => setStep("SELECT")} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                  Annuler
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {isLoading ? "Enregistrement..." : (isSecondValidation ? "Valider la conformité finale" : "Enregistrer l'attestation")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ETAPE 3 : QR CODE (Après 2ème validation) */}
        {step === "QR_CODE" && (
          <div className="p-8 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Traçabilité Validée</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              La seconde attestation a été enregistrée avec succès. Le produit est certifié conforme aux normes phytosanitaires.
            </p>

            <div className="bg-white p-6 rounded-2xl border-2 border-gray-200 shadow-sm mb-6 relative group">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                <ShieldCheck className="w-3 h-3" />
                Certifié
              </div>
              {/* Fake QR Code UI */}
              <div className="w-48 h-48 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '16px 16px', backgroundPosition: '0 0, 8px 8px', opacity: 0.1 }}></div>
                <QrCode className="w-32 h-32 text-gray-900 relative z-10" />
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-100 text-left w-full space-y-1">
                <p className="text-xs text-gray-500 flex justify-between"><span className="font-medium text-gray-900">Produit:</span> Pommes de Terre</p>
                <p className="text-xs text-gray-500 flex justify-between"><span className="font-medium text-gray-900">Origine:</span> PARC-2026-A1B2</p>
                <p className="text-xs text-gray-500 flex justify-between"><span className="font-medium text-gray-900">Contrôle:</span> Validé (2/2)</p>
              </div>
            </div>

            <div className="flex gap-4">
              <button className="px-6 py-2 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Imprimer l'étiquette
              </button>
              <button onClick={() => setStep("SELECT")} className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors">
                Terminer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
