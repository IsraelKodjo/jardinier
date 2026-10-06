"use client";

import { useState } from "react";
import { ArrowLeft, Download, Filter, Search, Layers, FileSpreadsheet, ChevronDown } from "lucide-react";
import Link from "next/link";

// Mock des données de commandes
const mockOrders = [
  { id: 1, culture: "Tomates Rondes", date: "2026-10-15", adresseLivraison: "Sokodé", quantite: 150, client: "Client A" },
  { id: 2, culture: "Tomates Rondes", date: "2026-10-15", adresseLivraison: "Sokodé", quantite: 300, client: "Client B" },
  { id: 3, culture: "Tomates Rondes", date: "2026-10-15", adresseLivraison: "Lomé", quantite: 50, client: "Client C" },
  { id: 4, culture: "Pommes de Terre", date: "2026-10-20", adresseLivraison: "Kpalimé", quantite: 500, client: "Client A" },
  { id: 5, culture: "Carottes Bio", date: "2026-10-12", adresseLivraison: "Sokodé", quantite: 80, client: "Client D" },
];

type AggregationMode = "NONE" | "CULTURE_DATE" | "CULTURE_DATE_ADRESSE";

export default function RapportsEtAgregation() {
  const [aggregation, setAggregation] = useState<AggregationMode>("CULTURE_DATE_ADRESSE");
  const [searchQuery, setSearchQuery] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const getAggregatedData = () => {
    if (aggregation === "NONE") {
      return mockOrders.map(o => ({ ...o, groupKey: o.id.toString(), count: 1, clients: [o.client] }));
    }

    const groups = new Map();

    mockOrders.forEach(order => {
      let key = "";
      if (aggregation === "CULTURE_DATE") {
        key = `${order.culture}_${order.date}`;
      } else if (aggregation === "CULTURE_DATE_ADRESSE") {
        key = `${order.culture}_${order.date}_${order.adresseLivraison}`;
      }

      if (groups.has(key)) {
        const existing = groups.get(key);
        existing.quantite += order.quantite;
        existing.count += 1;
        if (!existing.clients.includes(order.client)) {
          existing.clients.push(order.client);
        }
      } else {
        groups.set(key, {
          groupKey: key,
          culture: order.culture,
          date: order.date,
          adresseLivraison: aggregation === "CULTURE_DATE_ADRESSE" ? order.adresseLivraison : "Tous",
          quantite: order.quantite,
          count: 1,
          clients: [order.client]
        });
      }
    });

    return Array.from(groups.values());
  };

  const filteredData = getAggregatedData().filter(item => 
    item.culture.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.date.includes(searchQuery)
  );

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert("Fichier Excel (rapport_agrege.xlsx) généré et téléchargé avec succès !");
    }, 1200);
  };

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Rapports & Agrégations</h1>
            <p className="text-sm text-gray-500">Outils d'analyse pour les administrateurs</p>
          </div>
        </div>
        <button 
          onClick={handleExport}
          disabled={isExporting}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center gap-2 disabled:opacity-70"
        >
          {isExporting ? <span className="animate-pulse">Exportation...</span> : <FileSpreadsheet className="w-4 h-4" />}
          {isExporting ? "Génération Excel..." : "Exporter vers Excel"}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* FILTRES ET CONTROLES */}
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-4 items-end sm:items-center justify-between">
          <div className="w-full sm:w-auto flex-1 max-w-md">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Rechercher</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Culture, date..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
              />
            </div>
          </div>
          
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider flex items-center gap-1">
              <Layers className="w-3 h-3" /> Type d'agrégation
            </label>
            <div className="relative">
              <select
                value={aggregation}
                onChange={(e) => setAggregation(e.target.value as AggregationMode)}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-3 pr-10 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white appearance-none text-gray-900"
              >
                <option value="NONE" className="text-gray-900">Aucune agrégation (Liste brute)</option>
                <option value="CULTURE_DATE" className="text-gray-900">Agrégation : Culture + Date</option>
                <option value="CULTURE_DATE_ADRESSE" className="text-gray-900">Agrégation : Culture + Date + Adresse</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <ChevronDown className="h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* TABLEAU DES DONNEES */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Culture</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date prévue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adresse</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {aggregation !== "NONE" ? "Quantité Globale" : "Quantité"}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Détails</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Aucune donnée correspondant à votre recherche.
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.groupKey} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{row.culture}</div>
                      {aggregation !== "NONE" && (
                        <div className="text-xs text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">
                          Agrégé ({row.count} commandes)
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(row.date).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {row.adresseLivraison === "Tous" ? (
                        <span className="text-gray-400 italic">Multiples</span>
                      ) : (
                        <span className="font-medium text-gray-900">{row.adresseLivraison}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <span className={`text-lg font-bold ${aggregation !== "NONE" ? "text-green-700" : "text-gray-900"}`}>
                        {row.quantite} kg
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {aggregation !== "NONE" ? (
                        <span>Clients : {row.clients.join(", ")}</span>
                      ) : (
                        <span>{row.client}</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* FOOTER PAGINATION (Mock) */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <span className="text-sm text-gray-500">Affichage de {filteredData.length} résultats</span>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 bg-white opacity-50 cursor-not-allowed">Précédent</button>
            <button className="px-3 py-1 border border-gray-300 rounded text-sm text-gray-600 bg-white hover:bg-gray-50">Suivant</button>
          </div>
        </div>
      </div>
    </div>
  );
}
