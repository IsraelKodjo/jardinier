"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Sprout, Image as ImageIcon, Save, X } from "lucide-react";
import Link from "next/link";

// Mock des cultures gérées par l'admin
const initialCultures = [
  { id: "1", name: "Tomates Rondes", price: 1500, delay: 90, available: true },
  { id: "2", name: "Pommes de Terre", price: 800, delay: 120, available: true },
  { id: "3", name: "Carottes Bio", price: 1000, delay: 70, available: true },
  { id: "4", name: "Oignons Jaunes", price: 900, delay: 100, available: false },
];

export default function GestionCatalogue() {
  const [cultures, setCultures] = useState(initialCultures);
  const [searchQuery, setSearchQuery] = useState("");
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const toggleAvailability = (id: string) => {
    setCultures(cultures.map(c => c.id === id ? { ...c, available: !c.available } : c));
  };

  const handleDelete = (id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette culture du catalogue ?")) {
      setCultures(cultures.filter(c => c.id !== id));
    }
  };

  const filteredCultures = cultures.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestion des Cultures</h1>
          <p className="text-sm text-gray-500">Ajoutez, modifiez et gérez le catalogue proposé aux clients.</p>
        </div>
        <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          Nouvelle culture
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* FILTRES */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            {cultures.length} culture(s) enregistrée(s)
          </div>
        </div>

        {/* LISTE DES CULTURES */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Culture (Nom)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prix au kg (FCFA)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Délai maturation</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Statut Public</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCultures.map((culture) => (
                <tr key={culture.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-md flex items-center justify-center border border-gray-200">
                        <ImageIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{culture.name}</div>
                        <div className="text-xs text-gray-500">Image Adm. {parseInt(culture.id) + 1}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{culture.price} FCFA</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{culture.delay} jours</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button 
                      onClick={() => toggleAvailability(culture.id)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${culture.available ? 'bg-green-600' : 'bg-gray-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${culture.available ? 'translate-x-5' : 'translate-x-0'}`}></span>
                    </button>
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mt-1">
                      {culture.available ? 'Disponible' : 'Caché'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors" title="Modifier">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(culture.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors" title="Supprimer">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
