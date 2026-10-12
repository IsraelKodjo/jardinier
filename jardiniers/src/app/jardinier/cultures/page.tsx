"use client";

import { useState, useEffect } from "react";
import { Sprout, Plus, Search, MapPin, Trash2, Loader2, Calendar } from "lucide-react";
import Link from "next/link";
import { getJardinierProductionsAction, deleteProductionAction } from "../actions";

export default function MesCultures() {
  const [productions, setProductions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProductions = async () => {
    setLoading(true);
    const data = await getJardinierProductionsAction();
    setProductions(data);
    setLoading(false);
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette production ?")) return;
    setDeletingId(id);
    const res = await deleteProductionAction(id);
    if (res.success) {
      setProductions((prev) => prev.filter((p) => p.id !== id));
    } else {
      alert("Erreur lors de la suppression.");
    }
    setDeletingId(null);
  };

  const filteredProductions = productions.filter((p) =>
    (p.cultureName || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Productions Agricoles</h1>
          <p className="text-sm text-gray-500">
            Cultures déclarées et productions prévues sur vos parcelles.
          </p>
        </div>
        <Link
          href="/jardinier/cultures/nouvelle"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Publier une production
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une production..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mb-3" />
            <p className="text-gray-500 text-sm">Chargement de vos productions en base de données...</p>
          </div>
        ) : filteredProductions.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mb-4">
              <Sprout className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">Aucune culture enregistrée</h3>
            <p className="text-gray-500 text-sm max-w-md mb-6">
              Déclarez les légumes ou fruits que vous produisez sur vos parcelles pour qu'ils soient pris en compte dans les commandes.
            </p>
            <Link
              href="/jardinier/cultures/nouvelle"
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-sm transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Publier ma première culture
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Culture
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Parcelle associée
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Surface (Ha)
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Rendement estimé
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Disponibilité prévue
                  </th>
                  <th scope="col" className="px-6 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProductions.map((prod) => (
                  <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center mr-3 border border-green-100">
                          <Sprout className="h-5 w-5 text-green-600" />
                        </div>
                        <div className="text-sm font-bold text-gray-900">{prod.cultureName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-500" />
                        {prod.parcelleLocation || prod.parcelleId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-gray-900">{prod.surfaceUtilisee} Ha</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-100">
                        ~{prod.rendementEstime} kg
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-gray-400" />
                        {prod.dateDispo || "Non renseignée"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <button
                        onClick={() => handleDelete(prod.id)}
                        disabled={deletingId === prod.id}
                        className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer la production"
                      >
                        {deletingId === prod.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
