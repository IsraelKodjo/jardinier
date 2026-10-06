"use client";

import { useState } from "react";
import { ArrowLeft, ShoppingBag, Plus, Search, Calendar, MapPin, Package, Clock, CheckCircle, Truck, Info } from "lucide-react";
import Link from "next/link";

// Mock data pour les commandes du client
const mockClientOrders = [
  { 
    id: "CMD-2026-1042", 
    culture: "Tomates Rondes", 
    quantite: 150, 
    dateLivraison: "2026-11-15", 
    adresseLivraison: "Lomé, Quartier Agoè", 
    emballage: "Carton standard",
    status: "EN_ATTENTE", // EN_ATTENTE, EN_PRODUCTION, LIVRE
    dateLancement: "2026-08-17" 
  },
  { 
    id: "CMD-2026-0988", 
    culture: "Pommes de Terre", 
    quantite: 500, 
    dateLivraison: "2026-10-30", 
    adresseLivraison: "Kpalimé, Centre", 
    emballage: "Filet aéré",
    status: "EN_PRODUCTION",
    dateLancement: "2026-07-02" 
  },
  { 
    id: "CMD-2026-0512", 
    culture: "Carottes Bio", 
    quantite: 80, 
    dateLivraison: "2026-09-10", 
    adresseLivraison: "Sokodé, Marché", 
    emballage: "Vrac",
    status: "LIVRE",
    dateLancement: "2026-07-02" 
  },
];

type TabFilter = "TOUTES" | "EN_ATTENTE" | "EN_PRODUCTION" | "LIVRE";

export default function MesCommandes() {
  const [activeTab, setActiveTab] = useState<TabFilter>("TOUTES");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredOrders = mockClientOrders.filter(order => {
    const matchStatus = activeTab === "TOUTES" || order.status === activeTab;
    const matchSearch = order.culture.toLowerCase().includes(searchQuery.toLowerCase()) || order.id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'EN_ATTENTE': return { label: 'En attente', color: 'bg-amber-100 text-amber-800', icon: Clock };
      case 'EN_PRODUCTION': return { label: 'En production', color: 'bg-blue-100 text-blue-800', icon: Sprout };
      case 'LIVRE': return { label: 'Livrée', color: 'bg-green-100 text-green-800', icon: CheckCircle };
      default: return { label: 'Inconnu', color: 'bg-gray-100 text-gray-800', icon: Info };
    }
  };

  // Icône locale manquante dans l'import
  const Sprout = (props: any) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M7 20h10"/><path d="M10 20c5.5-1.25 5.5-12.75 5.5-12.75 0 0-4.5 1.5-6.5 5.5"/><path d="M17 20c-5.5-1.25-5.5-12.75-5.5-12.75 0 0 4.5 1.5 6.5 5.5"/>
    </svg>
  );

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Commandes</h1>
          <p className="text-sm text-gray-500">Suivez l'état de vos approvisionnements en temps réel.</p>
        </div>
        <Link 
          href="/client/commande/nouvelle"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle commande
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* TABS & SEARCH */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <button 
                onClick={() => setActiveTab("TOUTES")}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === "TOUTES" ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Toutes
              </button>
              <button 
                onClick={() => setActiveTab("EN_ATTENTE")}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === "EN_ATTENTE" ? 'bg-amber-100 text-amber-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                En attente
              </button>
              <button 
                onClick={() => setActiveTab("EN_PRODUCTION")}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === "EN_PRODUCTION" ? 'bg-blue-100 text-blue-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                En production
              </button>
              <button 
                onClick={() => setActiveTab("LIVRE")}
                className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-colors ${activeTab === "LIVRE" ? 'bg-green-100 text-green-900' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
              >
                Livrées
              </button>
            </div>

            <div className="relative shrink-0 sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="N° Commande, Culture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-full border outline-none bg-gray-50"
              />
            </div>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-lg font-medium text-gray-900 mb-1">Aucune commande trouvée</p>
            <p className="text-sm text-gray-500 mb-6">Vous n'avez pas de commande correspondant à ces critères.</p>
            <Link 
              href="/client/commande/nouvelle"
              className="text-green-600 font-medium hover:text-green-700"
            >
              Créer une nouvelle commande &rarr;
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const StatusIcon = statusInfo.icon;
              
              return (
                <li key={order.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    
                    {/* Header: ID + Status + Titre */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-sm font-mono font-bold text-gray-500">{order.id}</span>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${statusInfo.color}`}>
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{order.culture}</h3>
                      <p className="text-lg font-medium text-green-700 mt-1">{order.quantite} kg</p>
                    </div>

                    {/* Meta infos */}
                    <div className="flex-1 grid grid-cols-2 gap-y-3 gap-x-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Date livraison</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.dateLivraison).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Adresse</p>
                          <p className="text-sm font-medium text-gray-900">{order.adresseLivraison}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Emballage</p>
                          <p className="text-sm font-medium text-gray-900">{order.emballage}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Truck className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Lancement</p>
                          <p className="text-sm font-medium text-gray-900">{new Date(order.dateLancement).toLocaleDateString('fr-FR')}</p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="shrink-0 pt-4 md:pt-0 md:pl-4 md:border-l border-gray-100 flex md:flex-col justify-end">
                      <button className="w-full md:w-auto px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors">
                        Voir les détails
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
