import { ArrowRight, Leaf, Sprout, Tractor, Search, User } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-green-600 p-2 rounded-lg">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">Jardiniers</span>
          </div>
          <nav className="flex items-center gap-3 sm:gap-4">
            <Link 
              href="/connexion" 
              className="text-sm font-medium text-gray-600 hover:text-gray-900 px-2 py-2"
            >
              Se connecter
            </Link>
            <Link 
              href="/inscription" 
              className="text-sm font-medium bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              S'inscrire
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {/* HERO SECTION */}
        <section className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 lg:pt-20 lg:pb-24 flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight tracking-tight mb-6">
                Des cultures fraîches, <br className="hidden lg:block" />
                <span className="text-green-600">directement des producteurs</span>
              </h1>
              <p className="text-lg sm:text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0">
                Une plateforme simple et transparente pour commander des cultures de qualité, suivre leur production et garantir une traçabilité totale.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <a 
                  href="#cultures" 
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  Voir les cultures disponibles
                  <ArrowRight className="ml-2 w-5 h-5" />
                </a>
                <Link 
                  href="/inscription" 
                  className="inline-flex items-center justify-center px-6 py-3 border-2 border-gray-200 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-colors"
                >
                  Rejoindre la plateforme
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full max-w-md lg:max-w-none relative aspect-[4/3] rounded-2xl overflow-hidden shadow-xl bg-gray-100">
              <img 
                src="https://images.unsplash.com/photo-1500937386664-56d1dfef3854?q=80&w=800&auto=format&fit=crop" 
                alt="Champ agricole" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* ANNOUNCEMENT BANNER */}
        <section className="bg-amber-50 border-y border-amber-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <p className="text-sm font-medium text-amber-800">
              <strong className="font-bold">Nouveau :</strong> Les commandes pour la saison estivale sont ouvertes.
            </p>
          </div>
        </section>

        {/* CULTURES SECTION */}
        <section id="cultures" className="py-16 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 gap-4">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Cultures disponibles</h2>
                <p className="text-gray-600 mt-2">Découvrez les offres actuelles de nos jardiniers partenaires.</p>
              </div>
              <div className="w-full sm:w-auto flex relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher une culture..." 
                  className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm outline-none"
                />
              </div>
            </div>

            {/* CULTURES GRID */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[
                { name: "Tomates Rondes", price: "1500", delay: "90 jours", img: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=400&auto=format&fit=crop" },
                { name: "Pommes de Terre", price: "800", delay: "120 jours", img: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=400&auto=format&fit=crop" },
                { name: "Carottes Bio", price: "1000", delay: "70 jours", img: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=400&auto=format&fit=crop" },
                { name: "Oignons Jaunes", price: "900", delay: "100 jours", img: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=400&auto=format&fit=crop" },
              ].map((culture, idx) => (
                <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                  <div className="aspect-video bg-gray-100 relative">
                     <img 
                       src={culture.img} 
                       alt={culture.name} 
                       className="w-full h-full object-cover"
                     />
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{culture.name}</h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Disponible
                      </span>
                    </div>
                    <div className="space-y-1 mb-4 flex-grow">
                      <p className="text-sm text-gray-600 flex justify-between">
                        <span>Prix au kg</span>
                        <span className="font-semibold text-gray-900">{culture.price} FCFA</span>
                      </p>
                      <p className="text-sm text-gray-600 flex justify-between">
                        <span>Maturation</span>
                        <span className="font-medium text-gray-900">{culture.delay}</span>
                      </p>
                    </div>
                    <button className="w-full bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium py-2 px-4 rounded-md text-sm transition-colors shadow-sm">
                      Commander
                    </button>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-10 text-center">
              <button className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm">
                Voir toutes les cultures
              </button>
            </div>
          </div>
        </section>
        
        {/* HOW IT WORKS / IMAGE 6 */}
        <section className="py-16 bg-white border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
             <div className="flex flex-col lg:flex-row items-center gap-12">
               <div className="flex-1">
                 <h2 className="text-3xl font-bold text-gray-900 mb-6">Une plateforme au service de l'agriculture</h2>
                 <ul className="space-y-6">
                   <li className="flex gap-4">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                       <User className="w-5 h-5 text-green-600" />
                     </div>
                     <div>
                       <h4 className="text-lg font-semibold text-gray-900">Clients</h4>
                       <p className="text-gray-600 text-sm mt-1">Commandez facilement vos cultures en précisant vos besoins (quantité, date, aéroport).</p>
                     </div>
                   </li>
                   <li className="flex gap-4">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                       <Sprout className="w-5 h-5 text-blue-600" />
                     </div>
                     <div>
                       <h4 className="text-lg font-semibold text-gray-900">Jardiniers</h4>
                       <p className="text-gray-600 text-sm mt-1">Déclarez vos parcelles GPS, gérez vos productions et répondez aux commandes.</p>
                     </div>
                   </li>
                   <li className="flex gap-4">
                     <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                       <Search className="w-5 h-5 text-amber-600" />
                     </div>
                     <div>
                       <h4 className="text-lg font-semibold text-gray-900">Contrôleurs</h4>
                       <p className="text-gray-600 text-sm mt-1">Assurez la traçabilité phytosanitaire et générez les QR codes de conformité.</p>
                     </div>
                   </li>
                 </ul>
               </div>
               <div className="flex-1 w-full">
                 <div className="aspect-[4/3] rounded-2xl bg-gray-100 relative flex items-center justify-center overflow-hidden shadow-lg">
                    <img 
                      src="https://images.unsplash.com/photo-1488459716781-31db52582fe9?q=80&w=800&auto=format&fit=crop" 
                      alt="Marché agricole" 
                      className="w-full h-full object-cover"
                    />
                 </div>
               </div>
             </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="bg-gray-900 py-12 border-t border-gray-800 text-center sm:text-left">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
              <div className="bg-green-600 p-1.5 rounded-md">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">Jardiniers</span>
            </div>
            <p className="text-gray-400 text-sm">
              La plateforme de mise en relation et de coordination agricole.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Raccourcis</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#cultures" className="hover:text-white transition-colors">Cultures disponibles</Link></li>
              <li><Link href="/connexion" className="hover:text-white transition-colors">Se connecter</Link></li>
              <li><Link href="/inscription" className="hover:text-white transition-colors">Créer un compte</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Légal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="#" className="hover:text-white transition-colors">Conditions générales</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-gray-800 text-sm text-gray-500">
          &copy; {new Date().getFullYear()} Jardiniers. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
