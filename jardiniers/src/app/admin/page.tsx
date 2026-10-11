import { ArrowRight, ShoppingBag, Sprout, TrendingUp, Layers, Users, Clock, Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { cultures, commandes, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  // Récupération des données réelles depuis MySQL
  const allCultures = await db.select().from(cultures);
  const allOrders = await db
    .select({
      id: commandes.id,
      clientId: commandes.clientId,
      clientName: users.name,
      cultureName: commandes.cultureName,
      quantite: commandes.quantite,
      dateLivraison: commandes.dateLivraison,
      adresseLivraison: commandes.adresseLivraison,
      status: commandes.status,
      createdAt: commandes.createdAt,
    })
    .from(commandes)
    .leftJoin(users, eq(commandes.clientId, users.id))
    .orderBy(desc(commandes.createdAt));

  const allUsers = await db.select().from(users);

  const pendingOrdersCount = allOrders.filter((o) => o.status === "EN_ATTENTE").length;

  const stats = [
    {
      name: "Commandes en attente",
      value: pendingOrdersCount.toString(),
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      name: "Commandes totales",
      value: allOrders.length.toString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Cultures au catalogue",
      value: allCultures.length.toString(),
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Utilisateurs inscrits",
      value: allUsers.length.toString(),
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      name: "Réception des Commandes",
      href: "/admin/commandes",
      icon: ShoppingBag,
      desc: "Confirmer et gérer les commandes clients",
      color: "bg-green-600",
      text: "text-white",
    },
    {
      name: "Gestion du Catalogue",
      href: "/admin/catalogue",
      icon: Sprout,
      desc: "Gérer les produits, prix et photos",
      color: "bg-white",
      text: "text-gray-900 border border-gray-200",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Espace Administration</h1>
          <p className="text-gray-500 mt-1">Supervisez les commandes reçues et la production en temps réel.</p>
        </div>
        {pendingOrdersCount > 0 && (
          <Link
            href="/admin/commandes"
            className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg text-sm font-bold animate-pulse hover:bg-amber-100 transition-colors"
          >
            <Clock className="w-4 h-4 text-amber-600" />
            <span>{pendingOrdersCount} commande(s) à confirmer &rarr;</span>
          </Link>
        )}
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 flex items-center">
            <div className={`${stat.bg} p-3 rounded-lg mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ACTIONS RAPIDES */}
      <h2 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        {quickActions.map((act, i) => (
          <Link
            key={i}
            href={act.href}
            className={`${act.color} ${act.text} p-5 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32 hover:opacity-95`}
          >
            <div className="flex justify-between items-start">
              <act.icon className={`w-8 h-8 ${act.text === "text-white" ? "text-white" : "text-green-600"}`} />
              <ArrowRight className={`w-5 h-5 ${act.text === "text-white" ? "text-white/80" : "text-gray-400"}`} />
            </div>
            <div>
              <span className="font-bold text-lg block">{act.name}</span>
              <span className={`text-xs ${act.text === "text-white" ? "text-white/80" : "text-gray-500"}`}>{act.desc}</span>
            </div>
          </Link>
        ))}
      </div>

      {/* DERNIÈRES COMMANDES ARRIVÉES */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Dernières Commandes Reçues</h2>
        <Link href="/admin/commandes" className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline">
          Voir toutes les commandes &rarr;
        </Link>
      </div>

      {allOrders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center text-gray-500 shadow-sm">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-900 mb-1">Aucune commande pour le moment</p>
          <p className="text-sm text-gray-400">Les commandes passées par les clients apparaîtront ici instantanément.</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-100">
            {allOrders.slice(0, 5).map((order) => (
              <li key={order.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50/70 transition-colors">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                      {order.id}
                    </span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        order.status === "EN_ATTENTE"
                          ? "bg-amber-100 text-amber-800"
                          : order.status === "EN_PRODUCTION"
                          ? "bg-blue-100 text-blue-800"
                          : order.status === "LIVRE"
                          ? "bg-purple-100 text-purple-800"
                          : order.status === "RECEPTION_VALIDEE"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {order.status === "EN_ATTENTE"
                        ? "En attente"
                        : order.status === "EN_PRODUCTION"
                        ? "En production"
                        : order.status === "LIVRE"
                        ? "Livrée (Attente client)"
                        : order.status === "RECEPTION_VALIDEE"
                        ? "Réception validée"
                        : order.status}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-base">
                    {order.cultureName} <span className="text-green-700">({order.quantite} kg)</span>
                  </h4>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-3">
                    <span>Client : <strong className="text-gray-700">{order.clientName || "Client"}</strong></span>
                    <span>•</span>
                    <span>Livraison : {order.dateLivraison}</span>
                  </p>
                </div>
                <div className="shrink-0 flex items-center gap-3">
                  <Link
                    href="/admin/commandes"
                    className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-lg transition-colors"
                  >
                    Gérer & Valider
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}