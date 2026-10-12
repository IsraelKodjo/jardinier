"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  Map,
  Sprout,
  TrendingUp,
  MapPin,
  Plus,
  Loader2,
  Calendar,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { getJardinierDashboardStatsAction } from "./actions";

export default function JardinierDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    parcellesCount: 0,
    totalSurface: "0",
    productionsCount: 0,
    totalRendementKg: 0,
    recentParcelles: [] as any[],
    recentProductions: [] as any[],
  });

  useEffect(() => {
    async function loadStats() {
      setLoading(true);
      const data = await getJardinierDashboardStatsAction();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  const statsCards = [
    {
      name: "Parcelles déclarées",
      value: stats.parcellesCount,
      unit: "parcelles",
      icon: Map,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      name: "Surface totale",
      value: stats.totalSurface,
      unit: "Hectares",
      icon: Compass,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      name: "Cultures en production",
      value: stats.productionsCount,
      unit: "variétés",
      icon: Sprout,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      name: "Rendement estimé",
      value: stats.totalRendementKg.toLocaleString(),
      unit: "kg",
      icon: TrendingUp,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Tableau de bord Jardinier</h1>
        <p className="text-gray-500 mt-1 text-sm">
          Aperçu en direct de vos parcelles et productions agricoles enregistrées en base.
        </p>
      </div>

      {/* Cartes de statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, i) => (
          <div
            key={i}
            className="bg-white overflow-hidden shadow-xs rounded-2xl border border-gray-200 p-5 flex items-center"
          >
            <div className={`${stat.bg} p-3.5 rounded-xl mr-4 shrink-0`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{stat.name}</p>
              <div className="flex items-baseline gap-1 mt-1">
                <span className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stat.value}
                </span>
                <span className="text-xs text-gray-500 font-medium">{stat.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Actions rapides */}
      <div className="mb-8">
        <h2 className="text-base font-bold text-gray-900 mb-4">Actions Rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link
            href="/jardinier/parcelle/nouvelle"
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-36 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-emerald-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base block">Déclarer une parcelle (GPS)</span>
              <span className="text-xs text-gray-500 mt-0.5 block">Relevé GPS du terrain</span>
            </div>
          </Link>

          <Link
            href="/jardinier/cultures/nouvelle"
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-36 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-amber-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base block">Publier une culture</span>
              <span className="text-xs text-gray-500 mt-0.5 block">Ajouter une production en cours</span>
            </div>
          </Link>

          <Link
            href="/jardinier/parcelles"
            className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex flex-col justify-between h-36 group cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <Map className="w-5 h-5 text-blue-600" />
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>
            <div>
              <span className="font-bold text-gray-900 text-base block">Gérer mes parcelles</span>
              <span className="text-xs text-gray-500 mt-0.5 block">Liste et détails cartographiques</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Grille : Parcelles récentes et Productions récentes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parcelles récentes */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Map className="w-4 h-4 text-emerald-600" />
              Mes parcelles récentes
            </h3>
            <Link href="/jardinier/parcelles" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
              Tout voir →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Chargement...
            </div>
          ) : stats.recentParcelles.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Aucune parcelle enregistrée pour l'instant.</p>
              <Link
                href="/jardinier/parcelle/nouvelle"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Déclarer une parcelle GPS
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentParcelles.map((p) => (
                <div
                  key={p.id}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{p.location}</h4>
                      <p className="text-[11px] text-gray-500 font-mono">{p.id} • {p.surface} Ha</p>
                    </div>
                  </div>
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {p.status || "VALIDEE"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Productions récentes */}
        <div className="bg-white rounded-2xl shadow-xs border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
              <Sprout className="w-4 h-4 text-emerald-600" />
              Mes cultures en cours
            </h3>
            <Link href="/jardinier/cultures" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
              Tout voir →
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-gray-400 text-xs">
              <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-emerald-600" />
              Chargement...
            </div>
          ) : stats.recentProductions.length === 0 ? (
            <div className="py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-xs text-gray-500 mb-2">Aucune culture enregistrée pour l'instant.</p>
              <Link
                href="/jardinier/cultures/nouvelle"
                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
              >
                + Publier une culture
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {stats.recentProductions.map((pr) => (
                <div
                  key={pr.id}
                  className="p-3.5 bg-gray-50 rounded-xl border border-gray-100 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    {pr.image ? (
                      <img
                        src={pr.image}
                        alt={pr.cultureName}
                        className="w-9 h-9 rounded-lg object-cover border border-gray-200 shrink-0 shadow-2xs"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
                        <Sprout className="w-4 h-4" />
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{pr.cultureName}</h4>
                      <p className="text-[11px] text-gray-500">
                        Surface: {pr.surfaceUtilisee} Ha • ~{pr.rendementEstime} kg
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] text-gray-600 font-medium">
                    {pr.dateDispo || "En cours"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}