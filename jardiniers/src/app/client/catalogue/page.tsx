"use client";

import { useState } from "react";
import { Search, Filter, ShoppingBag, Clock, Leaf } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Mock des cultures disponibles pour les clients
const mockCultures = [
  { 
    id: "C1", 
    name: "Tomates Rondes", 
    price: 1500, 
    unit: "FCFA / kg", 
    maturationDays: 90,
    category: "Légume-fruit",
    description: "Tomates juteuses et charnues, idéales pour les sauces et salades. Cultivées sans pesticides chimiques de synthèse.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C2", 
    name: "Pommes de Terre", 
    price: 800, 
    unit: "FCFA / kg", 
    maturationDays: 120,
    category: "Tubercule",
    description: "Pommes de terre à chair ferme, parfaites pour la cuisson à la vapeur, rissolées ou en purée.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C3", 
    name: "Carottes Bio", 
    price: 1200, 
    unit: "FCFA / kg", 
    maturationDays: 70,
    category: "Légume-racine",
    description: "Carottes croquantes riches en vitamines, cultivées dans le respect des normes biologiques.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C4", 
    name: "Oignons Jaunes", 
    price: 900, 
    unit: "FCFA / kg", 
    maturationDays: 100,
    category: "Bulbe",
    description: "Indispensables dans toutes les cuisines, nos oignons se conservent longtemps et parfument vos plats.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C5", 
    name: "Poivrons Verts", 
    price: 2000, 
    unit: "FCFA / kg", 
    maturationDays: 85,
    category: "Légume-fruit",
    description: "Poivrons charnus et croquants, parfaits pour les grillades ou pour apporter de la couleur à vos plats.",
    image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=600&auto=format&fit=crop",
    available: false
  },
];

export default function CatalogueClient() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Toutes");

  const categories = ["Toutes", ...Array.from(new Set(mockCultures.map(c => c.category)))];

  const filteredCultures = mockCultures.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "Toutes" || c.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleOrder = (cultureName: string) => {
    // On pourrait passer le nom de la culture en paramètre d'URL pour pré-remplir le formulaire
    router.push(`/client/commande/nouvelle?culture=${encodeURIComponent(cultureName)}`);
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Catalogue des Cultures</h1>
        <p className="text-sm text-gray-500 mt-1">Découvrez les cultures disponibles, leurs prix et délais de maturation, et passez commande.</p>
      </div>

      {/* FILTRES & RECHERCHE */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Rechercher une culture (ex: Tomates)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 pr-3 py-2.5 sm:text-sm border-gray-300 rounded-md border outline-none bg-gray-50 text-gray-900"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 hide-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                categoryFilter === cat
                  ? "bg-gray-900 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* GRILLE DU CATALOGUE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCultures.map((culture) => (
          <div key={culture.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
            {/* Image */}
            <div className="aspect-[4/3] relative overflow-hidden bg-gray-100">
              <img 
                src={culture.image} 
                alt={culture.name} 
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${!culture.available && 'grayscale opacity-70'}`}
              />
              {!culture.available && (
                <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                  <span className="bg-white px-3 py-1 rounded text-xs font-bold text-gray-900 uppercase tracking-wider">Indisponible</span>
                </div>
              )}
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur-sm text-xs font-bold text-gray-900 px-2 py-1 rounded shadow-sm">
                  {culture.category}
                </span>
              </div>
            </div>

            {/* Contenu */}
            <div className="p-5 flex-1 flex flex-col">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{culture.name}</h3>
              </div>
              
              <div className="flex items-baseline gap-1 text-green-700 mb-3">
                <span className="text-xl font-bold">{culture.price.toLocaleString('fr-FR')}</span>
                <span className="text-sm font-medium">{culture.unit}</span>
              </div>
              
              <p className="text-sm text-gray-600 line-clamp-2 mb-4 flex-1">
                {culture.description}
              </p>

              <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2 rounded mb-4">
                <Clock className="w-4 h-4 shrink-0" />
                <span>Délai de maturation : <strong>{culture.maturationDays} jours</strong></span>
              </div>

              {/* Bouton d'action */}
              <button
                onClick={() => handleOrder(culture.name)}
                disabled={!culture.available}
                className={`w-full py-2.5 px-4 rounded-md font-bold flex items-center justify-center gap-2 transition-colors ${
                  culture.available 
                    ? "bg-green-600 hover:bg-green-700 text-white shadow-sm" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                {culture.available ? "Commander" : "Rupture de stock"}
              </button>
            </div>
          </div>
        ))}

        {filteredCultures.length === 0 && (
          <div className="col-span-full py-12 text-center text-gray-500">
            Aucune culture trouvée avec ces critères.
          </div>
        )}
      </div>
    </div>
  );
}
