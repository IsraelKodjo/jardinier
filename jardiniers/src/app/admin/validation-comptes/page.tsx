"use client";

import { useState } from "react";
import { ArrowLeft, UserCheck, UserX, FileText, Eye, ShieldAlert } from "lucide-react";
import Link from "next/link";

// Mock data
const mockPendingUsers = [
  { id: 1, nom: "Dupont", prenom: "Jean", email: "jean@example.com", role: "Jardinier", date: "Il y a 2h", document: "ID_Card_Dupont.pdf" },
  { id: 2, nom: "Martin", prenom: "Sophie", email: "sophie@example.com", role: "Contrôleur", date: "Il y a 4h", document: null },
  { id: 3, nom: "Lefebvre", prenom: "Marc", email: "marc@example.com", role: "Jardinier", date: "Hier", document: "Passeport_Marc.jpg" },
];

export default function ValidationComptes() {
  const [users, setUsers] = useState(mockPendingUsers);
  const [viewingDoc, setViewingDoc] = useState<string | null>(null);

  const handleValidate = (id: number) => {
    setUsers(users.filter(u => u.id !== id));
    // Afficher une notification temporaire de succès pourrait se faire ici
  };

  const handleRefuse = (id: number) => {
    if (confirm("Êtes-vous sûr de vouloir refuser et supprimer cette demande d'inscription ?")) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Validation des inscriptions</h1>
          <p className="text-sm text-gray-500">Gérez les demandes d'accès à la plateforme</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-500" />
            Comptes en attente de vérification ({users.length})
          </h2>
        </div>

        {users.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <UserCheck className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p>Toutes les demandes ont été traitées.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {users.map((user) => (
              <li key={user.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                
                {/* Infos utilisateur */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-gray-900 text-lg">{user.prenom} {user.nom}</span>
                    <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                      user.role === 'Jardinier' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 space-y-1">
                    <p>{user.email}</p>
                    <p>Inscrit : {user.date}</p>
                  </div>
                </div>

                {/* Document d'identité */}
                <div className="flex-1">
                  {user.document ? (
                    <div className="bg-gray-100 p-3 rounded-lg border border-gray-200 flex items-center justify-between">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-gray-500 flex-shrink-0" />
                        <span className="text-sm font-medium text-gray-700 truncate">{user.document}</span>
                      </div>
                      <button 
                        onClick={() => setViewingDoc(user.document)}
                        className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 bg-green-50 px-2 py-1 rounded"
                      >
                        <Eye className="w-3 h-3" /> Voir
                      </button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-400 italic">Aucun document requis pour ce rôle.</div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0">
                  <button 
                    onClick={() => handleRefuse(user.id)}
                    className="p-2 sm:px-4 sm:py-2 border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 font-medium rounded-md transition-colors flex items-center gap-2"
                  >
                    <UserX className="w-4 h-4" />
                    <span className="hidden sm:inline">Refuser</span>
                  </button>
                  <button 
                    onClick={() => handleValidate(user.id)}
                    className="p-2 sm:px-4 sm:py-2 border border-transparent text-white bg-green-600 hover:bg-green-700 font-medium rounded-md shadow-sm transition-colors flex items-center gap-2"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span className="hidden sm:inline">Valider le compte</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* MODAL VIEW DOCUMENT */}
      {viewingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/80" onClick={() => setViewingDoc(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold mb-4 flex justify-between items-center">
              Aperçu du document
              <button onClick={() => setViewingDoc(null)} className="text-gray-400 hover:text-gray-900">✕</button>
            </h3>
            <div className="aspect-[4/3] bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
              <FileText className="w-16 h-16 text-gray-300 mb-2" />
              <p className="text-gray-500 font-medium ml-2">{viewingDoc}</p>
            </div>
            <div className="mt-6 flex justify-end">
              <button onClick={() => setViewingDoc(null)} className="px-4 py-2 bg-gray-900 text-white rounded-md font-medium">Fermer l'aperçu</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
