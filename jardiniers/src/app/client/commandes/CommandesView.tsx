"use client";

import { useState } from "react";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Package,
  Clock,
  CheckCircle,
  CheckCircle2,
  Truck,
  Info,
  Sprout,
  ShoppingBag,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  X,
} from "lucide-react";
import Link from "next/link";
import { confirmOrderReceptionAction } from "./actions";

export interface CommandeItem {
  id: string;
  clientId: string;
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

export default function CommandesView({ orders }: { orders: CommandeItem[] }) {
  const [ordersList, setOrdersList] = useState<CommandeItem[]>(orders);
  const [activeTab, setActiveTab] = useState<TabFilter>("TOUTES");
  const [searchQuery, setSearchQuery] = useState("");

  // État du modal de validation de réception
  const [orderToConfirm, setOrderToConfirm] = useState<CommandeItem | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const pendingCount = ordersList.filter((o) => o.status === "EN_ATTENTE").length;
  const inProdCount = ordersList.filter((o) => o.status === "EN_PRODUCTION").length;
  const deliveredCount = ordersList.filter((o) => o.status === "LIVRE").length;
  const validatedCount = ordersList.filter((o) => o.status === "RECEPTION_VALIDEE").length;

  const filteredOrders = ordersList.filter((order) => {
    const matchStatus = activeTab === "TOUTES" || order.status === activeTab;
    const matchSearch =
      order.cultureName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.adresseLivraison.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const getStatusDisplay = (status: string | null) => {
    switch (status) {
      case "EN_ATTENTE":
        return {
          label: "En attente de confirmation",
          color: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
          desc: "Votre commande est enregistrée et sera bientôt confirmée par nos agronomes.",
        };
      case "EN_PRODUCTION":
        return {
          label: "En cours de production",
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Sprout,
          desc: "Les jardiniers cultivent et préparent vos légumes conformément aux normes.",
        };
      case "LIVRE":
        return {
          label: "Livrée (À confirmer)",
          color: "bg-purple-100 text-purple-800 border-purple-200",
          icon: Truck,
          desc: "Vos produits sont arrivés ! Veuillez confirmer la bonne réception ci-dessous.",
        };
      case "RECEPTION_VALIDEE":
        return {
          label: "Réception validée",
          color: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: CheckCircle2,
          desc: "Vous avez attesté la réception de vos produits. Commande clôturée avec succès.",
        };
      default:
        return {
          label: status || "Inconnu",
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: Info,
          desc: "",
        };
    }
  };

  const handleConfirmReception = async () => {
    if (!orderToConfirm) return;
    setIsConfirming(true);
    setFeedbackMessage(null);

    try {
      await confirmOrderReceptionAction(orderToConfirm.id);
      // Mise à jour de l'état local
      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === orderToConfirm.id ? { ...o, status: "RECEPTION_VALIDEE" } : o
        )
      );
      setFeedbackMessage({
        type: "success",
        text: `La réception de la commande #${orderToConfirm.id} (${orderToConfirm.cultureName}) a été validée avec succès !`,
      });
      setOrderToConfirm(null);
    } catch (err: any) {
      setFeedbackMessage({
        type: "error",
        text: err?.message || "Une erreur est survenue lors de la validation.",
      });
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Mes Commandes</h1>
          <p className="text-sm text-gray-500">Suivez vos cultures et validez vos réceptions en direct.</p>
        </div>
        <Link
          href="/client/commande/nouvelle"
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvelle commande
        </Link>
      </div>

      {/* MESSAGE FEEDBACK */}
      {feedbackMessage && (
        <div
          className={`mb-6 p-4 rounded-xl border flex items-center justify-between gap-3 ${
            feedbackMessage.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {feedbackMessage.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ALERTE SPÉCIALE SI COMMANDES LIVRÉES EN ATTENTE DE VALIDATION */}
      {deliveredCount > 0 && activeTab !== "LIVRE" && (
        <div className="mb-6 p-4 bg-purple-50 border border-purple-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <p className="font-bold text-purple-950 text-sm sm:text-base">
                {deliveredCount === 1
                  ? "1 commande a été livrée !"
                  : `${deliveredCount} commandes ont été livrées !`}
              </p>
              <p className="text-xs sm:text-sm text-purple-800">
                Vos produits sont arrivés. Veuillez confirmer la réception pour clôturer votre commande.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab("LIVRE")}
            className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer shadow-sm"
          >
            Voir les livraisons à valider &rarr;
          </button>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* TABS & SEARCH */}
        <div className="border-b border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex space-x-1 sm:space-x-2 overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
              <button
                onClick={() => setActiveTab("TOUTES")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "TOUTES"
                    ? "bg-gray-900 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Toutes ({ordersList.length})
              </button>
              <button
                onClick={() => setActiveTab("EN_ATTENTE")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "EN_ATTENTE"
                    ? "bg-amber-600 text-white"
                    : "bg-amber-50 text-amber-900 hover:bg-amber-100"
                }`}
              >
                En attente ({pendingCount})
              </button>
              <button
                onClick={() => setActiveTab("EN_PRODUCTION")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "EN_PRODUCTION"
                    ? "bg-blue-600 text-white"
                    : "bg-blue-50 text-blue-900 hover:bg-blue-100"
                }`}
              >
                En production ({inProdCount})
              </button>
              <button
                onClick={() => setActiveTab("LIVRE")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "LIVRE"
                    ? "bg-purple-600 text-white"
                    : "bg-purple-50 text-purple-900 hover:bg-purple-100"
                }`}
              >
                Livrées à valider ({deliveredCount})
              </button>
              <button
                onClick={() => setActiveTab("RECEPTION_VALIDEE")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-full whitespace-nowrap transition-colors cursor-pointer ${
                  activeTab === "RECEPTION_VALIDEE"
                    ? "bg-emerald-600 text-white"
                    : "bg-emerald-50 text-emerald-900 hover:bg-emerald-100"
                }`}
              >
                Réceptionnées ({validatedCount})
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
                className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 text-xs border-gray-300 rounded-full border outline-none bg-gray-50 text-gray-900 placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* LISTE DES COMMANDES */}
        {filteredOrders.length === 0 ? (
          <div className="p-16 text-center text-gray-500 flex flex-col items-center">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="text-lg font-bold text-gray-900 mb-1">Aucune commande trouvée</p>
            <p className="text-sm text-gray-500 mb-6">
              {activeTab === "TOUTES"
                ? "Vous n'avez pas encore passé de commande en base de données."
                : "Aucune commande ne correspond à ce filtre actuellement."}
            </p>
            {activeTab === "TOUTES" && (
              <Link
                href="/client/commande/nouvelle"
                className="text-green-600 font-bold hover:text-green-700 hover:underline"
              >
                Créer une nouvelle commande &rarr;
              </Link>
            )}
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {filteredOrders.map((order) => {
              const statusInfo = getStatusDisplay(order.status);
              const StatusIcon = statusInfo.icon;
              const canConfirmReception = order.status === "LIVRE" || order.status === "EN_PRODUCTION";
              const isDelivered = order.status === "LIVRE";
              const isReceptionValidated = order.status === "RECEPTION_VALIDEE";

              return (
                <li key={order.id} className="p-5 sm:p-6 hover:bg-gray-50/70 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    {/* Colonne 1 : ID, Statut & Produit */}
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

                      <h3 className="text-xl font-black text-gray-900">{order.cultureName}</h3>

                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-green-700">{order.quantite} kg</span>
                        {order.quantiteComplementaire && (
                          <span className="text-xs text-gray-500 font-medium">
                            (+ {order.quantiteComplementaire} kg compl.)
                          </span>
                        )}
                      </div>

                      {statusInfo.desc && (
                        <p className="text-xs text-gray-500 leading-relaxed">{statusInfo.desc}</p>
                      )}
                    </div>

                    {/* Colonne 2 : Détails Logistiques */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 flex-1 text-sm bg-gray-50 p-4 rounded-xl border border-gray-100">
                      <div className="flex items-start gap-2.5">
                        <Calendar className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">Date de livraison</p>
                          <p className="text-sm font-semibold text-gray-900">{order.dateLivraison}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <MapPin className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">Lieu de livraison</p>
                          <p className="text-sm font-semibold text-gray-900 leading-snug">
                            {order.adresseLivraison}
                          </p>
                          {(() => {
                            const match = order.adresseLivraison?.match(/GPS:\s*([-0-9.]+),\s*([-0-9.]+)/);
                            if (match) {
                              return (
                                <a
                                  href={`https://www.google.com/maps?q=${match[1]},${match[2]}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline mt-1 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                                >
                                  <span>Voir sur Google Maps</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              );
                            }
                            return null;
                          })()}
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Package className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">Emballage</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.emballage || "Standard"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-2.5">
                        <Truck className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                        <div>
                          <p className="text-xs text-gray-500 uppercase font-bold">Lancement</p>
                          <p className="text-sm font-semibold text-gray-900">
                            {order.dateLancement || "Non défini"}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Colonne 3 : Bouton de validation de réception pour le client */}
                    <div className="shrink-0 flex flex-col justify-center gap-2 lg:w-52">
                      {canConfirmReception && (
                        <div className="space-y-1.5">
                          {isDelivered && (
                            <span className="inline-block text-[11px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 text-center w-full">
                              Colis livré à destination
                            </span>
                          )}
                          <button
                            onClick={() => setOrderToConfirm(order)}
                            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Valider la réception</span>
                          </button>
                        </div>
                      )}

                      {isReceptionValidated && (
                        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
                          <div className="flex items-center justify-center gap-1.5 text-emerald-800 text-xs font-bold mb-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Réception confirmée</span>
                          </div>
                          <p className="text-[11px] text-emerald-700">
                            Merci d'avoir validé la réception de vos légumes !
                          </p>
                        </div>
                      )}

                      {order.status === "EN_ATTENTE" && (
                        <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-center text-xs text-gray-500">
                          En attente de confirmation par nos équipes
                        </div>
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* POP-UP / MODALE JOLIE DE CONFIRMATION DE RÉCEPTION */}
      {orderToConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2.5 text-emerald-700">
                <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Valider la Réception</h3>
              </div>
              <button
                onClick={() => setOrderToConfirm(null)}
                disabled={isConfirming}
                className="p-1 text-gray-400 hover:text-gray-700 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-5 space-y-4">
              <p className="text-sm text-gray-600">
                Vous vous apprêtez à attester la bonne réception de votre commande :
              </p>

              <div className="bg-emerald-50/50 border border-emerald-200/60 rounded-xl p-4 text-sm space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Référence :</span>
                  <span className="font-mono font-bold text-gray-800">#{orderToConfirm.id}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Culture / Produit :</span>
                  <span className="font-bold text-gray-900">{orderToConfirm.cultureName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Quantité :</span>
                  <span className="font-extrabold text-emerald-700">{orderToConfirm.quantite} kg</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-500 font-medium">Date prévue :</span>
                  <span className="font-semibold text-gray-800">{orderToConfirm.dateLivraison}</span>
                </div>
                <div className="border-t border-emerald-200/50 pt-2 text-xs text-gray-600">
                  <span className="font-medium text-gray-500 block">Lieu de livraison :</span>
                  <span className="font-semibold text-gray-800">{orderToConfirm.adresseLivraison}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  En confirmant, vous certifiez avoir bien reçu l'intégralité de vos légumes et que le produit est conforme. Cette commande sera marquée comme définitivement clôturée.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setOrderToConfirm(null)}
                disabled={isConfirming}
                className="flex-1 py-2.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmReception}
                disabled={isConfirming}
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Validation...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>Oui, j'ai bien reçu</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
