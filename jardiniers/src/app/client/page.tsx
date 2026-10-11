import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { commandes, cultures } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import {
  ArrowRight,
  ShoppingBag,
  BookOpen,
  Sprout,
  Truck,
  CheckCircle2,
  Clock,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ClientDashboard() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/connexion");
  }

  const userId = (session.user as any).id;

  // Récupération des données réelles depuis MySQL
  const userOrders = await db
    .select()
    .from(commandes)
    .where(eq(commandes.clientId, userId))
    .orderBy(desc(commandes.createdAt));

  const allCultures = await db.select().from(cultures);
  const availableCulturesCount = allCultures.filter((c) => c.available).length;

  const ordersToValidate = userOrders.filter((o) => o.status === "LIVRE");
  const activeOrdersCount = userOrders.filter(
    (o) => o.status === "EN_ATTENTE" || o.status === "EN_PRODUCTION" || o.status === "LIVRE"
  ).length;

  const stats = [
    {
      name: "Commandes actives",
      value: activeOrdersCount.toString(),
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Cultures disponibles",
      value: availableCulturesCount.toString(),
      icon: Sprout,
      color: "text-green-600",
      bg: "bg-green-50",
    },
    {
      name: "Livrées à valider",
      value: ordersToValidate.length.toString(),
      icon: Truck,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  const quickActions = [
    {
      name: "Nouvelle commande",
      href: "/client/commande/nouvelle",
      icon: ShoppingBag,
      color: "bg-green-600",
      text: "text-white",
    },
    {
      name: "Suivre mes commandes",
      href: "/client/commandes",
      icon: Truck,
      color: "bg-white",
      text: "text-gray-900 border border-gray-200 hover:bg-gray-50",
    },
    {
      name: "Consulter le Catalogue",
      href: "/client/catalogue",
      icon: BookOpen,
      color: "bg-white",
      text: "text-gray-900 border border-gray-200 hover:bg-gray-50",
    },
  ];

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case "EN_ATTENTE":
        return { label: "En attente", color: "bg-amber-50 text-amber-700 border-amber-200" };
      case "EN_PRODUCTION":
        return { label: "En production", color: "bg-blue-50 text-blue-700 border-blue-200" };
      case "LIVRE":
        return { label: "Livrée (À valider)", color: "bg-purple-50 text-purple-700 border-purple-200" };
      case "RECEPTION_VALIDEE":
        return { label: "Réception validée", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
      default:
        return { label: status || "Inconnu", color: "bg-gray-50 text-gray-700 border-gray-200" };
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Bienvenue, {session.user.name || "Espace Client"}
        </h1>
        <p className="text-gray-500 mt-1">Supervisez vos récoltes et vos réceptions en direct.</p>
      </div>

      {/* BANNIÈRE SI COMMANDE LIVRÉE EN ATTENTE DE VALIDATION */}
      {ordersToValidate.length > 0 && (
        <div className="mb-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-600/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-gray-900 text-base">
                {ordersToValidate.length === 1
                  ? "Votre commande a été livrée !"
                  : `${ordersToValidate.length} commandes ont été livrées !`}
              </p>
              <p className="text-sm text-gray-600">
                Vos légumes sont arrivés. Veuillez confirmer la bonne réception pour clôturer la livraison.
              </p>
            </div>
          </div>
          <Link
            href="/client/commandes"
            className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white rounded-xl text-xs font-bold shadow-md shadow-purple-700/20 transition-all hover:scale-[1.02] whitespace-nowrap text-center cursor-pointer"
          >
            Valider la réception &rarr;
          </Link>
        </div>
      )}

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 flex items-center"
          >
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
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {quickActions.map((act, i) => (
          <Link
            key={i}
            href={act.href}
            className={`${act.color} ${act.text} p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32 hover:opacity-90`}
          >
            <div className="flex justify-between items-start">
              <act.icon
                className={`w-7 h-7 opacity-80 ${act.text === "text-white" ? "" : "text-green-600"}`}
              />
              <ArrowRight
                className={`w-5 h-5 opacity-80 ${act.text === "text-white" ? "" : "text-gray-400"}`}
              />
            </div>
            <span className="font-bold text-base mt-4">{act.name}</span>
          </Link>
        ))}
      </div>

      {/* DERNIÈRES COMMANDES */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Dernières Commandes</h2>
        {userOrders.length > 0 && (
          <Link
            href="/client/commandes"
            className="text-sm font-bold text-green-600 hover:text-green-700 hover:underline"
          >
            Toutes mes commandes ({userOrders.length}) &rarr;
          </Link>
        )}
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-white border border-gray-100 rounded-xl p-8 text-center">
          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 mb-3">Vous n'avez pas encore de commande enregistrée.</p>
          <Link
            href="/client/commande/nouvelle"
            className="inline-flex items-center text-sm font-medium text-green-600 hover:text-green-700"
          >
            Créer votre première commande &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-gray-100 rounded-xl overflow-hidden shadow-sm">
          <ul className="divide-y divide-gray-100">
            {userOrders.slice(0, 5).map((order) => {
              const badge = getStatusBadge(order.status);
              return (
                <li key={order.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-gray-500">{order.id}</span>
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.label}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-gray-900 mt-1 truncate">
                      {order.cultureName} ({order.quantite} kg)
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">
                      Livraison : {order.dateLivraison} - {order.adresseLivraison}
                    </p>
                  </div>
                  <Link
                    href="/client/commandes"
                    className="shrink-0 px-3.5 py-1.5 text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                  >
                    Voir &rarr;
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
