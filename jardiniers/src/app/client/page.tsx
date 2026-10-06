"use client";
import { ArrowRight, ShoppingBag, BookOpen, Sprout } from "lucide-react";
import Link from "next/link";

export default function clientDashboard() {
  const stats = [
    {
        name: "Commandes actives",
        value: "3",
        icon: ShoppingBag,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        name: "Cultures disponibles",
        value: "24",
        icon: Sprout,
        color: "text-green-600",
        bg: "bg-green-50"
    }
];
  const quickActions = [
    {
        name: "Nouvelle commande",
        href: "/client/commande/nouvelle",
        icon: ShoppingBag,
        color: "bg-green-600",
        text: "text-white"
    },
    {
        name: "Consulter le Catalogue",
        href: "/client/catalogue",
        icon: BookOpen,
        color: "bg-white",
        text: "text-gray-900 border border-gray-200 hover:bg-gray-50"
    }
];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenue, Espace Client</h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de vos activités.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
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

      <h2 className="text-lg font-bold text-gray-900 mb-4">Actions Rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {quickActions.map((act, i) => (
          <Link key={i} href={act.href} className={`${act.color} ${act.text} p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32 hover:opacity-90`}>
            <div className="flex justify-between items-start">
              <act.icon className={`w-8 h-8 opacity-80 ${act.text === "text-white" ? "" : "text-green-600"}`} />
              <ArrowRight className={`w-5 h-5 opacity-80 ${act.text === "text-white" ? "" : "text-gray-400"}`} />
            </div>
            <span className="font-medium text-lg mt-4">{act.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
