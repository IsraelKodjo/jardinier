"use client";

import { useState, useEffect } from "react";
import { Map, Plus, MapPin, Trash2, Loader2, Compass } from "lucide-react";
import Link from "next/link";
import { getJardinierParcellesAction, deleteParcelleAction } from "../actions";

export default function MesParcelles() {
  const [parcelles, setParcelles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadParcelles = async () => {
    setLoading(true);
    const data = await getJardinierParcellesAction();
    setParcelles(data);
    setLoading(false);
  };

  useEffect(() => {
    loadParcelles();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette parcelle ?")) return;
    setDeletingId(id);
    const res = await deleteParcelleAction(id);
    if (res.success) {
      setParcelles((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erreur lors de la suppression.");
    }
    setDeletingId(null);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Parcelles Agricoles</h1>
          <p className="text-sm text-gray-500">
            Terrains et surfaces agricoles enregistrés dans votre base de données.
          </p>
        </div>
        <Link
          href="/jardinier/parcelle/nouvelle"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <MapPin className="w-4 h-4" />
          Déclarer une parcelle (GPS)
        </Link>
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
          <p className="text-gray-500 text-sm">Chargement de vos parcelles depuis la base de données...</p>
        </div>
      ) : parcelles.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
            <Compass className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Aucune parcelle enregistrée</h3>
          <p className="text-gray-500 text-sm max-w-md mb-6">
            Vous n'avez pas encore déclaré de terrain agricole. Utilisez le GPS pour enregistrer les coordonnées exactes de votre parcelle.
          </p>
          <Link
            href="/jardinier/parcelle/nouvelle"
            className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Déclarer ma première parcelle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parcelles.map((parcelle) => (
            <div
              key={parcelle.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-32 bg-emerald-50 relative w-full overflow-hidden flex items-center justify-center border-b border-emerald-100">
                <Map className="w-10 h-10 text-emerald-300 absolute" />
                <svg className="absolute w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <polygon
                    points="20,20 80,30 90,80 30,90"
                    fill="rgba(34, 197, 94, 0.25)"
                    stroke="rgba(21, 128, 61, 0.8)"
                    strokeWidth="2"
                  />
                </svg>
                <div className="absolute top-3 right-3">
                  <span
                    className={`text-[10px] uppercase font-bold px-2.5 py-1 rounded-full shadow-xs ${
                      parcelle.status === "VALIDEE"
                        ? "bg-green-100 text-green-800 border border-green-200"
                        : "bg-amber-100 text-amber-800 border border-amber-200"
                    }`}
                  >
                    {parcelle.status === "VALIDEE" ? "Prête / Validée" : "En attente"}
                  </span>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-2">
                  <h3 className="font-bold text-gray-900 text-base">{parcelle.location}</h3>
                  <p className="text-xs font-mono text-gray-400 mt-0.5">Réf : {parcelle.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-3 mb-4">
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="block text-[10px] text-gray-500 uppercase font-semibold">Surface</span>
                    <span className="block text-sm font-bold text-gray-900 mt-0.5">
                      {parcelle.surface} Ha
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    <span className="block text-[10px] text-gray-500 uppercase font-semibold">GPS</span>
                    <span className="block text-xs font-bold text-gray-900 mt-0.5 truncate">
                      {parcelle.lat && parcelle.lng ? `${parcelle.lat}, ${parcelle.lng}` : "Enregistré"}
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-xs text-gray-400">
                    {parcelle.createdAt
                      ? new Date(parcelle.createdAt).toLocaleDateString("fr-FR")
                      : "Récemment"}
                  </span>
                  <button
                    onClick={() => handleDelete(parcelle.id)}
                    disabled={deletingId === parcelle.id}
                    className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    title="Supprimer la parcelle"
                  >
                    {deletingId === parcelle.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}

          <Link
            href="/jardinier/parcelle/nouvelle"
            className="bg-white border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-green-50/50 hover:border-green-300 transition-all text-gray-500 hover:text-green-700 min-h-[240px] cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center mb-3 transition-colors">
              <Plus className="w-6 h-6 text-gray-500 group-hover:text-green-600" />
            </div>
            <span className="font-semibold text-sm">Déclarer une nouvelle parcelle</span>
            <span className="text-xs text-gray-400 mt-1">Relevé GPS en direct</span>
          </Link>
        </div>
      )}
    </div>
  );
}
