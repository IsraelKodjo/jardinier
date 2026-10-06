const fs = require('fs');
const path = require('path');

const roles = [
  {
    name: 'client',
    title: 'Espace Client',
    initials: 'CL',
    nav: [
      { name: 'Mon Tableau de bord', href: '/client', icon: 'LayoutDashboard' },
      { name: 'Créer une Commande', href: '/client/commande/nouvelle', icon: 'Plus' },
      { name: 'Mes Commandes', href: '/client/commandes', icon: 'ShoppingBag' }
    ],
    stats: [
      { name: "Commandes actives", value: "3", icon: "ShoppingBag", color: "text-blue-600", bg: "bg-blue-50" },
      { name: "Cultures disponibles", value: "24", icon: "Sprout", color: "text-green-600", bg: "bg-green-50" }
    ],
    quickActions: [
      { name: "Nouvelle commande", href: "/client/commande/nouvelle", icon: "ShoppingBag", desc: "Créer une commande", color: "bg-green-600", text: "text-white" }
    ]
  },
  {
    name: 'jardinier',
    title: 'Espace Jardinier',
    initials: 'JD',
    nav: [
      { name: 'Mon Tableau de bord', href: '/jardinier', icon: 'LayoutDashboard' },
      { name: 'Mes Parcelles', href: '/jardinier/parcelles', icon: 'Map' },
      { name: 'Déclarer Parcelle', href: '/jardinier/parcelle/nouvelle', icon: 'MapPin' }
    ],
    stats: [
      { name: "Parcelles déclarées", value: "2", icon: "Map", color: "text-green-600", bg: "bg-green-50" },
      { name: "Productions", value: "5", icon: "Sprout", color: "text-amber-600", bg: "bg-amber-50" }
    ],
    quickActions: [
      { name: "Déclarer une parcelle (GPS)", href: "/jardinier/parcelle/nouvelle", icon: "Map", desc: "Tracer une parcelle", color: "bg-white", text: "text-gray-900 border border-gray-200" }
    ]
  },
  {
    name: 'controleur',
    title: 'Espace Contrôleur',
    initials: 'CT',
    nav: [
      { name: 'Mon Tableau de bord', href: '/controleur', icon: 'LayoutDashboard' },
      { name: 'Contrôle Phytosanitaire', href: '/controleur/tracabilite', icon: 'ShieldCheck' }
    ],
    stats: [
      { name: "Contrôles en attente", value: "12", icon: "ShieldAlert", color: "text-amber-600", bg: "bg-amber-50" },
      { name: "Contrôles validés", value: "45", icon: "ShieldCheck", color: "text-green-600", bg: "bg-green-50" }
    ],
    quickActions: [
      { name: "Contrôle Phytosanitaire", href: "/controleur/tracabilite", icon: "CheckCircle", desc: "Effectuer un contrôle", color: "bg-amber-50", text: "text-amber-900 border border-amber-200" }
    ]
  },
  {
    name: 'admin',
    title: 'Espace Administration',
    initials: 'AD',
    nav: [
      { name: 'Tableau de bord', href: '/admin', icon: 'LayoutDashboard' },
      { name: 'Validation Comptes', href: '/admin/validation-comptes', icon: 'ShieldAlert' },
      { name: 'Catalogue Cultures', href: '/admin/catalogue', icon: 'Sprout' },
      { name: 'Rapports & Agrégations', href: '/admin/rapports', icon: 'Layers' },
      { name: 'Paramètres Système', href: '/admin/parametres', icon: 'Settings' }
    ],
    stats: [
      { name: "Comptes en attente", value: "8", icon: "Users", color: "text-red-600", bg: "bg-red-50" },
      { name: "Commandes totales", value: "142", icon: "ShoppingBag", color: "text-blue-600", bg: "bg-blue-50" },
      { name: "Chiffre d'affaires", value: "2.5M FCFA", icon: "TrendingUp", color: "text-green-600", bg: "bg-green-50" }
    ],
    quickActions: [
      { name: "Rapports & Agrégations", href: "/admin/rapports", icon: "Layers", desc: "Voir les données", color: "bg-white", text: "text-gray-900 border border-gray-200" },
      { name: "Validation Comptes", href: "/admin/validation-comptes", icon: "ShieldAlert", desc: "Modérer les inscrits", color: "bg-white", text: "text-gray-900 border border-gray-200" }
    ]
  }
];

roles.forEach(role => {
  const layoutCode = `"use client";
import { useState } from "react";
import { Leaf, LayoutDashboard, ShoppingBag, Map, Sprout, Settings, LogOut, Menu, X, Bell, Layers, ShieldAlert, CheckCircle, ShieldCheck, Plus, MapPin, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ${role.name}Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = ${JSON.stringify(role.nav, null, 4).replace(/"([^"]+)":/g, '$1:').replace(/"(LayoutDashboard|ShoppingBag|Map|Sprout|Settings|Layers|ShieldAlert|CheckCircle|ShieldCheck|Plus|MapPin|Users|TrendingUp)"/g, '$1')};

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-72 flex-col bg-gray-900 text-white transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <Leaf className="w-6 h-6 text-green-500 mr-2" />
          <span className="font-bold text-xl tracking-tight">Jardiniers.</span>
          <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">${role.name}</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group \${isActive ? 'bg-green-600 text-white shadow-md shadow-green-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}\`}>
                <item.icon className={\`w-5 h-5 \${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}\`} />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Déconnexion</span>
          </Link>
        </div>
      </aside>

      {/* MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
      )}
      <aside className={\`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:hidden flex flex-col \${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}\`}>
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800 shrink-0">
          <div className="flex items-center">
            <Leaf className="w-6 h-6 text-green-500 mr-2" />
            <span className="font-bold text-xl tracking-tight">Jardiniers.</span>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={\`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 \${isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}\`}>
                <item.icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-4 sm:px-8 shrink-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsMobileMenuOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="hidden sm:block">
              <span className="text-sm font-bold text-gray-900">${role.title}</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
              ${role.initials}
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}`;

  const pageCode = `"use client";
import { ArrowRight, ShoppingBag, Map, Sprout, TrendingUp, Clock, CheckCircle, ShieldAlert, ShieldCheck, Users, Layers } from "lucide-react";
import Link from "next/link";

export default function ${role.name}Dashboard() {
  const stats = ${JSON.stringify(role.stats, null, 4).replace(/"([^"]+)":/g, '$1:').replace(/"(ShoppingBag|Sprout|Map|ShieldAlert|ShieldCheck|Users|TrendingUp)"/g, '$1')};
  const quickActions = ${JSON.stringify(role.quickActions, null, 4).replace(/"([^"]+)":/g, '$1:').replace(/"(ShoppingBag|Map|CheckCircle|Layers|ShieldAlert)"/g, '$1')};

  return (
    <div className="max-w-6xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Bienvenue, ${role.title}</h1>
        <p className="text-gray-500 mt-1">Voici un aperçu de vos activités.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5 flex items-center">
            <div className={\`\${stat.bg} p-3 rounded-lg mr-4\`}>
              <stat.icon className={\`w-6 h-6 \${stat.color}\`} />
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
          <Link key={i} href={act.href} className={\`\${act.color} \${act.text} p-4 rounded-xl shadow-sm flex flex-col justify-between transition-colors h-32 hover:opacity-90\`}>
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
}`;

  fs.writeFileSync(path.join(__dirname, 'src', 'app', role.name, 'layout.tsx'), layoutCode);
  fs.writeFileSync(path.join(__dirname, 'src', 'app', role.name, 'page.tsx'), pageCode);
});

console.log("Roles created successfully");
