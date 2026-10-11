import {
  ArrowRight,
  ShoppingBag,
  Sprout,
  TrendingUp,
  Layers,
  Users,
  Clock,
  Calendar,
  MapPin,
  AlertTriangle,
  Database,
} from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { cultures, commandes, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { ensureDatabaseInitialized } from "@/db/init";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let allCultures: any[] = [];
  let allOrders: any[] = [];
  let allUsers: any[] = [];
  let dbError: string | null = null;

  try {
    allCultures = await db.select().from(cultures);
  } catch (err: any) {
    console.warn("Tentative d'initialisation automatique des tables :", err?.message);
    if (
      err?.message?.includes("doesn't exist") ||
      err?.message?.includes("Failed query") ||
      err?.message?.includes("1146")
    ) {
      const initResult = await ensureDatabaseInitialized();
      if (initResult.success) {
        try {
          allCultures = await db.select().from(cultures);
        } catch (retryErr: any) {
          dbError = retryErr?.message;
        }
      } else {
        dbError = initResult.error;
      }
    } else {
      dbError = err?.message || "Impossible de joindre la base de données MySQL.";
    }
  }

  if (!dbError) {
    try {
      allOrders = await db
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

      allUsers = await db.select().from(users);
    } catch (orderErr: any) {
      console.warn("Erreur chargement commandes/utilisateurs :", orderErr?.message);
    }
  }

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

      {/* BANNIÈRE D'AIDE SI LA BASE EST DÉCONNECTÉE */}
      {dbError && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-300 rounded-2xl shadow-sm">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-xl text-amber-700 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-extrabold text-amber-900 text-lg">
                Configuration requise : Base de données MySQL non connectée
              </h3>
              <p className="text-sm text-amber-800">
                Le serveur Render fonctionne parfaitement, mais votre variable <code>DATABASE_URL</code> doit être configurée pour se connecter à votre base en ligne.
              </p>
              <div className="p-2.5 bg-white/80 border border-amber-200 rounded-lg text-xs font-mono text-amber-950">
                Détail : {dbError}
              </div>
              <div className="pt-2 text-xs text-amber-900 space-y-1">
                <p className="font-bold">👉 Pour connecter votre base MySQL sur Render :</p>
                <ol className="list-decimal list-inside pl-1 space-y-1">
                  <li>Allez sur le dashboard Render &rarr; cliquez sur votre service <strong>jardinier</strong>.</li>
                  <li>Dans le menu de gauche, ouvrez l'onglet <strong>Environment</strong>.</li>
                  <li>Ajoutez la variable <code>DATABASE_URL</code> avec l'adresse de votre base MySQL (ex: Aiven, TiDB, Clever Cloud).</li>
                  <li>
                    Visitez ensuite <Link href="/api/db-init" className="underline font-bold text-blue-700">/api/db-init</Link> pour créer les tables automatiquement en 1 seconde !
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className={`${act.color} ${act.text} p-6 rounded-xl shadow-sm flex flex-col justify-between transition-all hover:shadow-md h-36`}
          >
            <div>
              <div className="flex items-center justify-between">
                <act.icon className="w-7 h-7" />
                <ArrowRight className="w-5 h-5 opacity-60" />
              </div>
              <h3 className="text-lg font-bold mt-3">{act.name}</h3>
              <p className="text-xs opacity-75 mt-1">{act.desc}</p>
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