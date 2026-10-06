"use client";
import { useState, useEffect } from "react";
import { Map, Plus, Navigation, MapPin, ChevronRight, FileCheck } from "lucide-react";
import Link from "next/link";

const initialParcelles = [
  { id: "PARC-2026-001", location: "Kpalimé, Togo", surface: 2.5, lat: 6.90, lng: 0.63, status: "VALIDEE", date: "2026-01-15" },
  { id: "PARC-2026-002", location: "Sokodé, Togo", surface: 5.0, lat: 8.98, lng: 1.13, status: "EN_ATTENTE", date: "2026-09-10" },
];

export default function MesParcelles() {
  const [parcelles, setParcelles] = useState(initialParcelles);

  // Charger les parcelles ajoutées localement (Simulation de base de données)
  useEffect(() => {
    const saved = localStorage.getItem('mock_parcelles');
    if (saved) {
      setParcelles([...JSON.parse(saved), ...initialParcelles]);
    }
  }, []);

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Parcelles</h1>
          <p className="text-sm text-gray-500">Gérez vos terrains agricoles enregistrés par GPS.</p>
        </div>
        <Link href="/jardinier/parcelle/nouvelle" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
          <MapPin className="w-4 h-4" />
          Déclarer une parcelle
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parcelles.map((parcelle) => (
          <div key={parcelle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className="h-32 bg-gray-100 relative w-full overflow-hidden flex items-center justify-center">
              <Map className="w-10 h-10 text-gray-300 absolute" />
              <div className="absolute inset-0 bg-green-900/5" />
              <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <polygon points="20,20 80,30 90,80 30,90" fill="rgba(34, 197, 94, 0.3)" stroke="rgba(21, 128, 61, 0.8)" strokeWidth="2" />
              </svg>
              <div className="absolute top-2 right-2">
                <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded shadow-sm ${parcelle.status === 'VALIDEE' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}>
                  {parcelle.status === 'VALIDEE' ? 'Validée' : 'En attente'}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-gray-900">{parcelle.location}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Réf: {parcelle.id}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4 mb-4">
                <div className="bg-gray-50 p-2 rounded">
                  <span className="block text-[10px] text-gray-500 uppercase font-medium">Surface</span>
                  <span className="block text-sm font-bold text-gray-900">{parcelle.surface} Hectares</span>
                </div>
                <div className="bg-gray-50 p-2 rounded">
                  <span className="block text-[10px] text-gray-500 uppercase font-medium">Coordonnées</span>
                  <span className="block text-sm font-bold text-gray-900 text-xs mt-0.5">{parcelle.lat}, {parcelle.lng}</span>
                </div>
              </div>

              <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-500">Déclarée le {new Date(parcelle.date).toLocaleDateString('fr-FR')}</span>
                <button className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1">
                  Détails <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        <Link href="/jardinier/parcelle/nouvelle" className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center p-8 hover:bg-gray-100 hover:border-gray-400 transition-all text-gray-500 hover:text-gray-700 min-h-[250px]">
          <Plus className="w-10 h-10 mb-2 text-gray-400" />
          <span className="font-medium">Nouvelle Déclaration GPS</span>
        </Link>
      </div>
    </div>
  );
}
