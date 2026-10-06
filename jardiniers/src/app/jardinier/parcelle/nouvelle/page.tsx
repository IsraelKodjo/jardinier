"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Play, Square, CheckCircle2, Navigation, AlertTriangle } from "lucide-react";
import Link from "next/link";

type GpsState = "IDLE" | "LOCATING" | "READY" | "RECORDING" | "FINISHED";

export default function NouvelleParcelle() {
  const [gpsState, setGpsState] = useState<GpsState>("IDLE");
  const [points, setPoints] = useState<number>(0);
  const [reference, setReference] = useState<string>("");

  const handleLocate = () => {
    setGpsState("LOCATING");
    // Simulation de l'acquisition GPS
    setTimeout(() => {
      setGpsState("READY");
    }, 1500);
  };

  const handleStartRecording = () => {
    setGpsState("RECORDING");
    // Simulation de l'enregistrement de points (un point toutes les secondes)
    const interval = setInterval(() => {
      setPoints((p) => {
        if (p >= 15) {
          clearInterval(interval);
          return p;
        }
        return p + 1;
      });
    }, 800);
  };

  const handleClosePolygon = () => {
    setGpsState("FINISHED");
    // Génération de la référence unique
    const uniqueRef = `PARC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    setReference(uniqueRef); const newParcelle = { id: uniqueRef, location: 'Nouvelle Parcelle (GPS)', surface: 1.5, lat: '6.12', lng: '1.22', status: 'EN_ATTENTE', date: new Date().toISOString() }; const existing = JSON.parse(localStorage.getItem('mock_parcelles') || '[]'); localStorage.setItem('mock_parcelles', JSON.stringify([newParcelle, ...existing]));
  };

  return (
    <div className="max-w-3xl mx-auto pb-12 flex flex-col min-h-[calc(100vh-4rem)]">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-6 shrink-0">
        <Link href="/jardinier" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Déclarer une parcelle</h1>
          <p className="text-sm text-gray-500">Traçage GPS du périmètre</p>
        </div>
      </div>

      {/* ETAPES / INSTRUCTIONS */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6 shrink-0">
        <div className="flex justify-between items-center relative">
          <div className="absolute inset-y-1/2 left-0 w-full h-0.5 bg-gray-100 -z-10"></div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${gpsState !== "IDLE" ? 'bg-green-600 border-green-600 text-white' : 'border-gray-300 text-gray-400'}`}>1</div>
            <span className="text-[10px] sm:text-xs mt-1 text-center font-medium">Position initiale</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${gpsState === "RECORDING" || gpsState === "FINISHED" ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>2</div>
            <span className="text-[10px] sm:text-xs mt-1 text-center font-medium">Parcourir</span>
          </div>
          
          <div className="flex flex-col items-center bg-white px-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${gpsState === "FINISHED" ? 'bg-green-600 border-green-600 text-white' : 'bg-white border-gray-300 text-gray-400'}`}>3</div>
            <span className="text-[10px] sm:text-xs mt-1 text-center font-medium">Clôturer</span>
          </div>
        </div>
      </div>

      {/* ZONE CARTE (SIMULATION) */}
      <div className="flex-1 bg-green-50 rounded-xl border-2 border-green-100 overflow-hidden relative min-h-[300px] flex items-center justify-center">
        {/* Grille de fond simulant une carte */}
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(#22c55e 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        
        {gpsState === "IDLE" && (
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm relative z-10 max-w-xs">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700">Rendez-vous sur votre parcelle et définissez le point de départ.</p>
          </div>
        )}

        {gpsState === "LOCATING" && (
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm relative z-10 max-w-xs">
            <Navigation className="w-12 h-12 text-blue-500 animate-pulse mx-auto mb-3" />
            <p className="text-sm font-medium text-blue-700">Recherche du signal GPS...</p>
          </div>
        )}

        {gpsState === "READY" && (
          <div className="text-center p-6 bg-white/80 rounded-lg shadow-sm backdrop-blur-sm relative z-10 max-w-xs">
            <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-3 ring-4 ring-blue-200 animate-pulse"></div>
            <p className="text-sm font-medium text-gray-900">Point de départ fixé. Prêt à enregistrer.</p>
          </div>
        )}

        {gpsState === "RECORDING" && (
          <div className="text-center relative z-10">
            <div className="w-4 h-4 bg-red-600 rounded-full mx-auto mb-3 ring-4 ring-red-200 animate-pulse"></div>
            <div className="bg-white/90 px-4 py-2 rounded-full shadow-sm font-bold text-red-600">
              Enregistrement en cours... ({points} points)
            </div>
            {/* Simulation visuelle de dessin (très basique pour l'UI) */}
            <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 -z-10 overflow-visible">
              <path 
                d={`M 128 128 ${Array.from({length: points}).map((_, i) => `L ${128 + Math.sin(i)*50} ${128 + Math.cos(i)*40}`).join(" ")}`} 
                fill="none" 
                stroke="#22c55e" 
                strokeWidth="4" 
                strokeDasharray="4"
              />
            </svg>
          </div>
        )}

        {gpsState === "FINISHED" && (
          <div className="text-center relative z-10 bg-white/90 p-6 rounded-xl shadow-lg border border-green-200">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Parcelle enregistrée !</h3>
            <div className="bg-green-50 p-3 rounded-lg border border-green-100">
              <span className="block text-xs text-green-700 uppercase font-bold tracking-wider mb-1">RÉFÉRENCE UNIQUE</span>
              <span className="block text-2xl font-mono text-green-900">{reference}</span>
            </div>
          </div>
        )}
      </div>

      {/* PANNEAU DE CONTROLE (En bas) */}
      <div className="mt-6 shrink-0">
        {gpsState === "IDLE" && (
          <button 
            onClick={handleLocate}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <MapPin className="w-5 h-5" />
            1. Obtenir ma position de départ
          </button>
        )}

        {gpsState === "READY" && (
          <div className="space-y-3">
            <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg flex gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-600 shrink-0" />
              <p className="text-xs text-blue-800">
                L'enregistrement a commencé. Marchez tout autour du périmètre de votre parcelle. La boucle se fermera automatiquement si vous revenez au point de départ.
              </p>
            </div>
            <button 
              onClick={handleStartRecording}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <Play className="w-5 h-5 fill-white" />
              2. Commencer le parcours
            </button>
          </div>
        )}

        {gpsState === "RECORDING" && (
          <button 
            onClick={handleClosePolygon}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2"
          >
            <Square className="w-5 h-5 fill-white" />
            3. Clôturer la parcelle manuellement
          </button>
        )}

        {gpsState === "FINISHED" && (
          <Link 
            href="/jardinier"
            className="w-full flex bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-6 rounded-xl shadow-md transition-colors items-center justify-center gap-2"
          >
            Retourner au tableau de bord
          </Link>
        )}
      </div>
    </div>
  );
}
