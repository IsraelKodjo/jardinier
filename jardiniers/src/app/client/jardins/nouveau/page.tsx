import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { createJardin } from "./actions";

export default async function NouveauJardinPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/connexion");
  }

  return (
    <div className="max-w-2xl mx-auto pb-12 p-4 md:p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Ajouter un nouveau jardin</h1>
      
      <form action={createJardin} className="bg-white border border-gray-200 p-6 rounded-xl shadow-sm space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nom du jardin *</label>
          <input type="text" id="name" name="name" required placeholder="Ex: Mon potager derrière la maison" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border bg-white text-gray-900 placeholder:text-gray-400" />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" name="description" rows={3} placeholder="Quelques détails utiles sur votre jardin..." className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border bg-white text-gray-900 placeholder:text-gray-400"></textarea>
        </div>

        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700">Adresse complète</label>
          <input type="text" id="address" name="address" placeholder="Ex: 12 Rue des Lilas, 75000 Paris" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border bg-white text-gray-900 placeholder:text-gray-400" />
        </div>

        <div>
          <label htmlFor="surface" className="block text-sm font-medium text-gray-700">Surface (en m²)</label>
          <input type="number" id="surface" name="surface" min="1" placeholder="Ex: 50" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2 border bg-white text-gray-900 placeholder:text-gray-400" />
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
          <a href="/client" className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors">
            Annuler
          </a>
          <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer">
            Enregistrer le jardin
          </button>
        </div>
      </form>
    </div>
  );
}
