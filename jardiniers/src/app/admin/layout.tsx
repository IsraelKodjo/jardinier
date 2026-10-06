"use client";
import { useState } from "react";
import { Leaf, LayoutDashboard, ShoppingBag, Map, Sprout, Settings, LogOut, Menu, X, Bell, Layers, ShieldAlert, CheckCircle, ShieldCheck, Plus, MapPin, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function adminLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigation = [
    {
        name: "Tableau de bord",
        href: "/admin",
        icon: LayoutDashboard
    },
    {
        name: "Validation Comptes",
        href: "/admin/validation-comptes",
        icon: ShieldAlert
    },
    {
        name: "Catalogue Cultures",
        href: "/admin/catalogue",
        icon: Sprout
    },
    {
        name: "Rapports & Agrégations",
        href: "/admin/rapports",
        icon: Layers
    },
    {
        name: "Paramètres Système",
        href: "/admin/parametres",
        icon: Settings
    }
];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="hidden md:flex w-72 flex-col bg-gray-900 text-white transition-all duration-300">
        <div className="h-16 flex items-center px-6 border-b border-gray-800 shrink-0">
          <Leaf className="w-6 h-6 text-green-500 mr-2" />
          <span className="font-bold text-xl tracking-tight">Jardiniers.</span>
          <span className="ml-2 text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded uppercase">admin</span>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive ? 'bg-green-600 text-white shadow-md shadow-green-900/20' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'}`} />
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
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
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
              <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)} className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
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
              <span className="text-sm font-bold text-gray-900">Espace Administration</span>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors relative">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-green-500 to-emerald-400 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white">
              AD
            </div>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-8 custom-scrollbar">
          {children}
        </div>
      </main>
    </div>
  );
}