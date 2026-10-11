"use client";

import { useState } from "react";
import { Shield, Users, Plus, Search, Key, Sprout, ArrowRight } from "lucide-react";
import Link from "next/link";

// Liste des administrateurs
const initialAdmins = [
  { id: 1, name: "Jean Dupont", email: "jean.dupont@jardiniers.tg", role: "ADMIN_SUP", status: "ACTIF", date: "2026-01-10" },
  { id: 2, name: "Alice Mensah", email: "alice.mensah@jardiniers.tg", role: "ADMIN", status: "ACTIF", date: "2026-02-15" },
  { id: 3, name: "Marc Koffi", email: "marc.koffi@jardiniers.tg", role: "ADMIN", status: "ACTIF", date: "2026-05-20" },
  { id: 4, name: "Sophie Attoh", email: "sophie.attoh@jardiniers.tg", role: "ADMIN", status: "REVOQUE", date: "2026-08-01" },
];

export default function ParametresAdminSuperieur() {
  const [admins, setAdmins] = useState(initialAdmins);
  const [searchQuery, setSearchQuery] = useState("");

  const handleRevoke = (id: number) => {
    if (confirm("Voulez-vous vraiment révoquer les accès de cet administrateur ?")) {
      setAdmins(admins.map(a => a.id === id ? { ...a, status: "REVOQUE" } : a));
    }
  };

  const handleRestore = (id: number) => {
    setAdmins(admins.map(a => a.id === id ? { ...a, status: "ACTIF" } : a));
  };

  const filteredAdmins = admins.filter(
    a => a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
         a.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      {/* HEADER */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <Shield className="w-5 h-5 text-amber-500" />
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Admin Supérieur</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Paramètres Systèmes</h1>
        <p className="text-sm text-gray-500">Gérez les comptes administrateurs et les accès de la plateforme.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* SIDEBAR NAVIGATION */}
        <div className="w-full md:w-64 shrink-0 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col p-2 space-y-1">
              <button 
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium bg-green-50 text-green-700 w-full text-left"
              >
                <Users className="w-5 h-5 text-green-600" />
                Administrateurs & Droits
              </button>
            </nav>
          </div>

          {/* Raccourci vers la gestion des produits & photos */}
          <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm mb-1">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Gestion des Produits & Photos</span>
            </div>
            <p className="text-xs text-emerald-700 mb-3">
              Les photos et détails de chaque culture se gèrent désormais directement depuis le catalogue.
            </p>
            <Link
              href="/admin/catalogue"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 underline"
            >
              <span>Accéder au catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Administrateurs & Permissions</h2>
                <p className="text-sm text-gray-500 mt-1">Créez des administrateurs et gérez leurs niveaux d'accès à la plateforme.</p>
              </div>
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 shrink-0 cursor-pointer">
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
              <div className="text-xs text-gray-500 font-medium">
                {filteredAdmins.length} administrateur(s)
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
                              <button onClick={() => handleRevoke(admin.id)} className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition-colors cursor-pointer">
                                Révoquer
                              </button>
                            ) : (
                              <button onClick={() => handleRestore(admin.id)} className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded transition-colors cursor-pointer">
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
        </div>
      </div>
    </div>
  );
}
