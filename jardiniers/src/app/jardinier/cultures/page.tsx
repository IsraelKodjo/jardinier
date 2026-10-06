"use client";
import { useState, useEffect } from "react";
import { Sprout, Plus, Search, MapPin, Trash2, Edit2 } from "lucide-react";
import Link from "next/link";

const initialProductions = [
  { id: 1, culture: "Tomates Rondes", parcelle: "PARC-2026-001 (Kpalimé)", surfaceUtilisee: 1.5, rendementEstime: 500, dateDispo: "2026-11-01" },
  { id: 2, culture: "Carottes Bio", parcelle: "PARC-2026-002 (Sokodé)", surfaceUtilisee: 2.0, rendementEstime: 1200, dateDispo: "2026-10-15" }
];

export default function MesCultures() {
  const [productions, setProductions] = useState(initialProductions);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem('mock_productions');
    if (saved) {
      setProductions([...JSON.parse(saved), ...initialProductions]);
    }
  }, []);

  const filteredProductions = productions.filter(p => p.culture.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Cultures (Productions)</h1>
          <p className="text-sm text-gray-500">Déclarez ce que vous cultivez pour recevoir des commandes.</p>
        </div>
        <Link href="/jardinier/cultures/nouvelle" className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Publier une culture
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une production..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Culture sélectionnée</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcelle</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surf. Allouée (Ha)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rendement Est. (kg)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Disponibilité</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProductions.map((prod) => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-green-50 rounded-full flex items-center justify-center">
                        <Sprout className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-bold text-gray-900">{prod.culture}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      {prod.parcelle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{prod.surfaceUtilisee} Ha</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-green-700">~{prod.rendementEstime} kg</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{new Date(prod.dateDispo).toLocaleDateString('fr-FR')}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProductions.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Aucune production trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
