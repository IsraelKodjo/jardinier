import { ArrowRight, ShoppingBag, Map, Sprout, TrendingUp, Clock, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* HEADER SECTION */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">Bonjour, Jean</h1>
        <p className="mt-1 text-sm text-gray-500">Voici un aperçu de vos activités récentes sur la plateforme.</p>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { name: "Commandes actives", value: "3", icon: ShoppingBag, color: "text-blue-600", bg: "bg-blue-50" },
          { name: "Parcelles déclarées", value: "2", icon: Map, color: "text-green-600", bg: "bg-green-50" },
          { name: "Dépenses (ce mois)", value: "250 000 FCFA", icon: TrendingUp, color: "text-amber-600", bg: "bg-amber-50" },
          { name: "Cultures disponibles", value: "24", icon: Sprout, color: "text-purple-600", bg: "bg-purple-50" },
        ].map((stat, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 flex items-center">
            <div className={`p-3 rounded-lg ${stat.bg} mr-4`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 truncate">{stat.name}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MAIN ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/dashboard/commande/nouvelle" className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32">
          <div className="flex justify-between items-start">
            <ShoppingBag className="w-8 h-8 opacity-80" />
            <ArrowRight className="w-5 h-5 opacity-80" />
          </div>
          <span className="font-medium text-lg mt-4">Nouvelle commande</span>
        </Link>
        <Link href="/dashboard/parcelle/nouvelle" className="bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32">
          <div className="flex justify-between items-start">
            <Map className="w-8 h-8 text-green-600" />
            <ArrowRight className="w-5 h-5 text-gray-400" />
          </div>
          <span className="font-medium text-lg mt-4">Déclarer parcelle GPS</span>
        </Link>
        <Link href="/dashboard/tracabilite" className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32">
          <div className="flex justify-between items-start">
            <CheckCircle className="w-8 h-8 text-amber-600" />
            <ArrowRight className="w-5 h-5 text-amber-500" />
          </div>
          <span className="font-medium text-lg mt-4">Contrôle Phytosanitaire</span>
        </Link>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-4 py-5 sm:px-6 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-lg leading-6 font-bold text-gray-900">10 dernières commandes</h3>
          <button className="text-sm font-medium text-green-600 hover:text-green-500">Tout voir</button>
        </div>
        
        {/* Mobile View (Cards) */}
        <div className="block sm:hidden">
          <ul className="divide-y divide-gray-100">
            {[
              { culture: "Tomates Rondes", qte: "50 kg", date: "15 Oct 2026", status: "En attente", statusIcon: Clock, statusColor: "text-amber-500", bg: "bg-amber-50" },
              { culture: "Pommes de Terre", qte: "200 kg", date: "20 Oct 2026", status: "Validée", statusIcon: CheckCircle, statusColor: "text-green-500", bg: "bg-green-50" },
              { culture: "Carottes Bio", qte: "30 kg", date: "12 Oct 2026", status: "Livrée", statusIcon: CheckCircle, statusColor: "text-gray-500", bg: "bg-gray-100" },
            ].map((order, i) => (
              <li key={i} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-sm font-bold text-gray-900">{order.culture}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${order.bg} ${order.statusColor}`}>
                    <order.statusIcon className="w-3 h-3 mr-1" />
                    {order.status}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>{order.qte}</span>
                  <span>Livraison : {order.date}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Desktop View (Table) */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Culture</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantité</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de livraison</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {[
                { culture: "Tomates Rondes", qte: "50 kg", date: "15 Oct 2026", status: "En attente", statusIcon: Clock, statusColor: "text-amber-500", bg: "bg-amber-50" },
                { culture: "Pommes de Terre", qte: "200 kg", date: "20 Oct 2026", status: "Validée", statusIcon: CheckCircle, statusColor: "text-green-500", bg: "bg-green-50" },
                { culture: "Carottes Bio", qte: "30 kg", date: "12 Oct 2026", status: "Livrée", statusIcon: CheckCircle, statusColor: "text-gray-500", bg: "bg-gray-100" },
              ].map((order, i) => (
                <tr key={i} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.culture}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.qte}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${order.bg} ${order.statusColor}`}>
                      <order.statusIcon className="w-4 h-4 mr-1.5" />
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
