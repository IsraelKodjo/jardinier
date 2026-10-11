"use client";

import { useState } from "react";
import {
  ShoppingBag,
  Search,
  Calendar,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  Truck,
  ExternalLink,
  User,
  ArrowRight,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import { updateOrderStatusAction } from "./actions";

export interface AdminOrder {
  id: string;
  clientId: string;
  clientName: string | null;
  clientEmail: string | null;
  cultureId: string;
  cultureName: string;
  quantite: number;
  dateLivraison: string;
  adresseLivraison: string;
  emballage: string | null;
  status: string | null;
  dateLancement: string | null;
  quantiteComplementaire: string | null;
  createdAt: Date | null;
}

type TabFilter = "TOUTES" | "EN_ATTENTE" | "EN_PRODUCTION" | "LIVRE" | "RECEPTION_VALIDEE";

export default function AdminCommandesView({ initialOrders }: { initialOrders: AdminOrder[] }) {
  const [orders, setOrders] = useState<AdminOrder[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<TabFilter>("TOUTES");
  const [searchQuery, setSearchQuery] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const pendingCount = orders.filter((o) => o.status === "EN_ATTENTE").length;
  const inProdCount = orders.filter((o) => o.status === "EN_PRODUCTION").length;
  const deliveredCount = orders.filter((o) => o.status === "LIVRE").length;
  const validatedCount = orders.filter((o) => o.status === "RECEPTION_VALIDEE").length;

  const filteredOrders = orders.filter((order) => {
    const matchStatus = activeTab === "TOUTES" || order.status === activeTab;
    const matchSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.cultureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.clientName && order.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (order.clientEmail && order.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchStatus && matchSearch;
  });

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await updateOrderStatusAction(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      alert("Erreur lors de la mise à jour du statut.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "EN_ATTENTE":
        return {
          label: "En attente de confirmation",
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
        };
      case "EN_PRODUCTION":
        return {
          label: "En production",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Sprout,
        };
      case "LIVRE":
        return {
          label: "Livrée (Attente client)",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Truck,
        };
      case "RECEPTION_VALIDEE":
        return {
          label: "Réception validée par le client",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
        };
      default:
        return {
          label: status || "Inconnu",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: AlertCircle,
        };
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      {/* HEADER */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Gestion des Commandes Reçues
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Supervisez les demandes clients, lancez les productions et suivez les validations de réception.
          </p>
        </div>

        {/* Badge récapitulatif rapide */}
        <div className="flex items-center gap-2">
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-bold">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>{pendingCount} à confirmer</span>
            </span>
          )}
          {deliveredCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-lg text-xs font-bold">
              <Truck className="w-3.5 h-3.5 text-purple-600" />
              <span>{deliveredCount} en attente validation client</span>
            </span>
          )}
          {validatedCount > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{validatedCount} clôturée(s)</span>
            </span>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* FILTRES PAR ONGLETS & RECHERCHE */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <button
                onClick={() => setActiveTab("TOUTES")}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "TOUTES"
                    ? "bg-gray-900 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Toutes ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("EN_ATTENTE")}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${
                  activeTab === "EN_ATTENTE"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                <span>En attente</span>
                {pendingCount > 0 && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded-full bg-amber-100 text-amber-800 font-bold">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab("EN_PRODUCTION")}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "EN_PRODUCTION"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                En production ({inProdCount})
              </button>
              <button
                onClick={() => setActiveTab("LIVRE")}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "LIVRE"
                    ? "bg-purple-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Livrées à valider ({deliveredCount})
              </button>
              <button
                onClick={() => setActiveTab("RECEPTION_VALIDEE")}
                className={`px-3.5 py-2 text-xs font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "RECEPTION_VALIDEE"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                }`}
              >
                Réception validée ({validatedCount})
              </button>
            </div>

            <div className="relative shrink-0 sm:w-72">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Rechercher par N°, client, culture..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 text-xs border-gray-300 rounded-lg border outline-none bg-white text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-lg font-bold text-gray-900 mb-1">Aucune commande trouvée</p>
            <p className="text-sm text-gray-500">
              {activeTab === "TOUTES"
                ? "Aucun client n'a encore passé de commande en base de données."
                : "Aucune commande ne correspond à ce filtre actuellement."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusBadge(order.status);
              const StatusIcon = statusInfo.icon;
              const isUpdating = updatingId === order.id;

              // Détection coordonnées GPS éventuelles
              const gpsMatch = order.adresseLivraison?.match(/GPS:\s*([-0-9.]+),\s*([-0-9.]+)/);

              return (
                <li key={order.id} className="p-5 sm:p-6 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Colonne 1 : ID, Statut, Culture & Client */}
                    <div className="space-y-2 lg:max-w-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          {order.id}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusInfo.color}`}
                        >
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>

                      <h3 className="text-xl font-extrabold text-gray-900">{order.cultureName}</h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-green-700">{order.quantite} kg</span>
                        {order.quantiteComplementaire && (
                          <span className="text-xs text-gray-500 font-medium">
                            (+ {order.quantiteComplementaire} kg compl.)
                          </span>
                        )}
                      </div>

                      {/* Infos Client */}
                      <div className="flex items-center gap-2 text-xs text-gray-600 pt-1 border-t border-gray-100">
                        <User className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <span className="font-semibold text-gray-900">{order.clientName || "Client"}</span>
                        {order.clientEmail && <span className="text-gray-400">({order.clientEmail})</span>}
                      </div>
                    </div>

                    {/* Colonne 2 : Détails Livraison, Adresse, Google Maps */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 flex-1 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div>
                        <span className="text-xs uppercase font-bold text-gray-400 block mb-0.5">Livraison souhaitée</span>
                        <div className="flex items-center gap-1.5 font-semibold text-gray-800">
                          <Calendar className="w-4 h-4 text-green-600" />
                          <span>{order.dateLivraison}</span>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs uppercase font-bold text-gray-400 block mb-0.5">Date commande</span>
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Clock className="w-4 h-4 text-gray-400" />
                          <span>
                            {order.createdAt
                              ? new Date(order.createdAt).toLocaleDateString("fr-FR", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "Récemment"}
                          </span>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <span className="text-xs uppercase font-bold text-gray-400 block mb-0.5">Lieu de livraison & Itinéraire</span>
                        <div className="flex items-start gap-1.5 text-gray-800">
                          <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                          <div className="space-y-1">
                            <span className="font-medium">{order.adresseLivraison}</span>
                            {gpsMatch && (
                              <div>
                                <a
                                  href={`https://www.google.com/maps?q=${gpsMatch[1]},${gpsMatch[2]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                >
                                  <span>Ouvrir sur Google Maps</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <span className="text-xs uppercase font-bold text-gray-400 block mb-0.5">Emballage</span>
                        <div className="flex items-center gap-1.5 text-gray-700">
                          <Package className="w-4 h-4 text-gray-400" />
                          <span>{order.emballage || "Standard"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Colonne 3 : Actions de validation pour l'Admin */}
                    <div className="flex flex-col gap-2 shrink-0 lg:w-52 justify-center">
                      {order.status === "EN_ATTENTE" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "EN_PRODUCTION")}
                          disabled={isUpdating}
                          className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Confirmer la commande</span>
                            </>
                          )}
                        </button>
                      )}

                      {order.status === "EN_PRODUCTION" && (
                        <button
                          onClick={() => handleStatusChange(order.id, "LIVRE")}
                          disabled={isUpdating}
                          className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                          {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <Truck className="w-4 h-4" />
                              <span>Marquer comme Livrée</span>
                            </>
                          )}
                        </button>
                      )}

                      {order.status === "LIVRE" && (
                        <div className="space-y-1.5">
                          <div className="p-2 rounded-lg bg-purple-50 border border-purple-200 text-purple-900 text-[11px] font-bold text-center">
                            Livrée — En attente validation client
                          </div>
                          <button
                            onClick={() => handleStatusChange(order.id, "RECEPTION_VALIDEE")}
                            disabled={isUpdating}
                            className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                            title="Valider manuellement si le client a confirmé par téléphone"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Valider réception (Admin)</span>
                          </button>
                        </div>
                      )}

                      {order.status === "RECEPTION_VALIDEE" && (
                        <div className="text-center p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-center gap-1.5">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>Réception validée (Clôturée)</span>
                        </div>
                      )}

                      {/* Menu de changement de statut libre */}
                      <select
                        value={order.status || "EN_ATTENTE"}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        disabled={isUpdating}
                        className="w-full text-xs font-medium px-2 py-1.5 border border-gray-300 rounded-lg bg-white text-gray-700 outline-none focus:ring-1 focus:ring-green-500 cursor-pointer"
                      >
                        <option value="EN_ATTENTE">En attente</option>
                        <option value="EN_PRODUCTION">En production</option>
                        <option value="LIVRE">Livrée (Attente client)</option>
                        <option value="RECEPTION_VALIDEE">Réception validée (Clôturée)</option>
                        <option value="ANNULE">Annulée</option>
                      </select>
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
