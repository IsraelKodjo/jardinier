"use client";

import { useState } from "react";
import { Settings, Image as ImageIcon, Users, Shield, Upload, Trash2, LayoutTemplate, Bug, Plus, Search, MoreVertical, Key } from "lucide-react";
import Link from "next/link";

type Tab = "PHOTOS" | "ADMINS";

// Mock des 6 photos de l'accueil
const initialPhotos = [
  { id: 1, url: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop", name: "Tomates", location: "Accueil - Hero" },
  { id: 2, url: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=400&auto=format&fit=crop", name: "Pommes de Terre", location: "Catalogue 1" },
  { id: 3, url: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop", name: "Carottes", location: "Catalogue 2" },
  { id: 4, url: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=400&auto=format&fit=crop", name: "Oignons", location: "Catalogue 3" },
  { id: 5, url: null, name: "Emplacement Vide", location: "Catalogue 4" },
  { id: 6, url: null, name: "Emplacement Vide", location: "Bannière Bas" },
];

// Mock des administrateurs
const initialAdmins = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@jardiniers.tg", role: "ADMIN_SUP", status: "ACTIF", date: "2026-01-10" },
  { id: 2, name: "Alice Mensah", email: "alice.mensah@jardiniers.tg", role: "ADMIN", status: "ACTIF", date: "2026-02-15" },
  { id: 3, name: "Marc Koffi", email: "marc.koffi@jardiniers.tg", role: "ADMIN", status: "ACTIF", date: "2026-05-20" },
  { id: 4, name: "Sophie Attoh", email: "sophie.attoh@jardiniers.tg", role: "ADMIN", status: "REVOQUE", date: "2026-08-01" },
];

export default function ParametresAdminSuperieur() {
  const [activeTab, setActiveTab] = useState<Tab>("ADMINS"); // Changed default to ADMINS for the user to see it directly
  const [photos, setPhotos] = useState(initialPhotos);
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");

  const handleUpload = (id: number) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, url: "https://images.unsplash.com/photo-1589923188900-85dae523342b?q=80&w=400&auto=format&fit=crop", name: "Nouvelle Image" } : p));
  };

  const handleRemove = (id: number) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, url: null, name: "Emplacement Vide" } : p));
  };

  const handleRevoke = (id: number) => {
    if(confirm("Voulez-vous vraiment révoquer les accès de cet administrateur ?")) {
      setAdmins(admins.map(a => a.id === id ? { ...a, status: "REVOQUE" } : a));
    }
  };

  const handleRestore = (id: number) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, status: "ACTIF" } : a));
  };

  const filteredAdmins = admins.filter(a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.email.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto pb-12">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Supérieur</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres Systèmes</h1>
        <p className="text-sm text-gray-500">Gérez les configurations globales et les contenus visuels de la plateforme.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              <button 
                onClick={() => setActiveTab("ADMINS")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'ADMINS' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Users className="w-5 h-5" />
                Administrateurs & Droits
              </button>
              <button 
                onClick={() => setActiveTab("PHOTOS")}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'PHOTOS' ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <LayoutTemplate className="w-5 h-5" />
                Contenus Accueil (6 Photos)
              </button>
            </nav>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1">
          
          {/* TAB: ADMINS */}
          {activeTab === "ADMINS" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Administrateurs & Permissions</h2>
                  <p className="text-sm text-gray-500 mt-1">Créez des administrateurs et gérez leurs niveaux d'accès à la plateforme.</p>
                </div>
                <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0">
                  <Plus className="w-4 h-4" />
                  Nouvel Administrateur
                </button>
              </div>
              
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Administrateur</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Niveau d'accès</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold">
                              {admin.name.charAt(0)}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-bold text-gray-900">{admin.name}</div>
                              <div className="text-sm text-gray-500">{admin.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.role === "ADMIN_SUP" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 border border-amber-200">
                              <Shield className="w-3 h-3" /> Supérieur
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                              <Key className="w-3 h-3" /> Standard
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.status === "ACTIF" ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Actif
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Révoqué
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {admin.role !== "ADMIN_SUP" && (
                            <>
                              {admin.status === "ACTIF" ? (
                                <button onClick={() => handleRevoke(admin.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors">
                                  Révoquer
                                </button>
                              ) : (
                                <button onClick={() => handleRestore(admin.id)} className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors">
                                  Restaurer
                                </button>
                              )}
                            </>
                          )}
                          {admin.role === "ADMIN_SUP" && (
                            <span className="text-gray-400 text-xs italic">Intouchable</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: PHOTOS */}
          {activeTab === "PHOTOS" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <h2 className="text-lg font-bold text-gray-900">Gestion des 6 Photos de l'Accueil</h2>
                <p className="text-sm text-gray-500 mt-1">Conformément au cahier des charges, l'accueil affiche exactement 6 images contrôlables par l'administrateur supérieur.</p>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {photos.map((photo, idx) => (
                    <div key={photo.id} className="border border-gray-200 rounded-lg overflow-hidden flex flex-col group relative">
                      <div className="bg-gray-50 px-3 py-2 border-b border-gray-200 flex justify-between items-center">
                        <span className="text-xs font-bold text-gray-500 uppercase">Slot {idx + 1}</span>
                        <span className="text-xs font-medium text-gray-700">{photo.location}</span>
                      </div>
                      
                      <div className="aspect-video bg-gray-100 relative flex items-center justify-center overflow-hidden">
                        {photo.url ? (
                          <>
                            <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                              <button onClick={() => handleUpload(photo.id)} className="px-3 py-1.5 bg-white text-gray-900 text-xs font-bold rounded flex items-center gap-2 hover:bg-gray-100">
                                <Upload className="w-3 h-3" /> Changer
                              </button>
                              <button onClick={() => handleRemove(photo.id)} className="px-3 py-1.5 bg-red-600 text-white text-xs font-bold rounded flex items-center gap-2 hover:bg-red-700">
                                <Trash2 className="w-3 h-3" /> Retirer
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                            <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-xs">Aucune image</p>
                            <button onClick={() => handleUpload(photo.id)} className="mt-3 px-3 py-1.5 bg-green-600 text-white text-xs font-bold rounded flex items-center gap-2 hover:bg-green-700">
                              <Upload className="w-3 h-3" /> Charger
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="px-3 py-2 bg-white">
                        <p className="text-sm font-medium text-gray-900 truncate">{photo.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
