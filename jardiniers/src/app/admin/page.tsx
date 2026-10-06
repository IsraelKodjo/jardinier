"use client";
import { ArrowRight, ShoppingBag, Map, Sprout, TrendingUp, Clock, CheckCircle, ShieldAlert, ShieldCheck, Users, Layers } from "lucide-react";
import Link from "next/link";

export default function adminDashboard() {
  const stats = [
    {
        name: "Comptes en attente",
        value: "8",
        icon: Users,
        color: "text-red-600",
        bg: "bg-red-50"
    },
    {
        name: "Commandes totales",
        value: "142",
        icon: ShoppingBag,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        name: "Chiffre d'affaires",
        value: "2.5M FCFA",
        icon: TrendingUp,
        color: "text-green-600",
        bg: "bg-green-50"
    }
];
  const quickActions = [
    {
        name: "Rapports & Agrégations",
        href: "/admin/rapports",
        icon: Layers,
        desc: "Voir les données",
        color: "bg-white",
        text: "text-gray-900 border border-gray-200"
    },
    {
        name: "Validation Comptes",
        href: "/admin/validation-comptes",
        icon: ShieldAlert,
        desc: "Modérer les inscrits",
        color: "bg-white",
        text: "text-gray-900 border border-gray-200"
    }
];

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenue, Espace Administration</h1>
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
              <act.icon className="w-8 h-8 opacity-80" />
              <ArrowRight className="w-5 h-5 opacity-80" />
            </div>
            <span className="font-medium text-lg mt-4">{act.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}