"use client";

import { useState } from "react";
import Link from "next/link";
import { Sprout, User, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import { registerUserAction } from "./actions";
import { signIn } from "next-auth/react";

export default function InscriptionPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const formData = new FormData(e.currentTarget);
    const name = (formData.get("name") as string)?.trim();
    const email = (formData.get("email") as string)?.trim().toLowerCase();
    const password = formData.get("password") as string;
    const role = (formData.get("role") as string) || "client";

    try {
      const res = await registerUserAction({ name, email, password, role });

      if (!res.success) {
        setErrorMessage(res.error || "Une erreur est survenue lors de l'inscription.");
        setIsLoading(false);
        return;
      }

      // Connexion automatique instantanée dès l'inscription
      const signInResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (signInResult?.ok) {
        // Redirection directe vers l'espace approprié
        if (role === "jardinier") {
          window.location.href = "/jardinier";
        } else {
          window.location.href = "/client";
        }
      } else {
        // En cas de fallback, rediriger vers la page de connexion
        window.location.href = "/connexion";
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage("Une erreur inattendue est survenue.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center justify-center gap-2 mb-4 hover:opacity-90 transition-opacity">
          <div className="bg-green-600 p-2.5 rounded-xl shadow-sm">
            <Sprout className="w-7 h-7 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Jardiniers</span>
        </Link>
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
          Créez votre compte
        </h2>
        <p className="mt-1 text-sm text-gray-600">
          Rejoignez la communauté Jardiniers dès aujourd'hui
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-gray-200 rounded-2xl sm:px-10">
          
          {/* Message d'erreur élégant */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nom complet */}
            <div>
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
                Nom complet
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <User className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Ex : Koffi Mensah"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Adresse email
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="nom@exemple.com"
                  className="block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
                Mot de passe
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Au moins 6 caractères"
                  minLength={6}
                  className="block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                />
              </div>
            </div>

            {/* Rôle */}
            <div>
              <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-1">
                Je suis un...
              </label>
              <select
                id="role"
                name="role"
                defaultValue="jardinier"
                className="block w-full px-3.5 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all font-medium"
              >
                <option value="jardinier" className="text-gray-900 bg-white">
                  🌱 Jardinier (Je gère mes parcelles & productions)
                </option>
                <option value="client" className="text-gray-900 bg-white">
                  🛒 Client (Je commande des produits frais)
                </option>
              </select>
            </div>

            {/* Bouton de soumission */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création du compte en cours...
                  </>
                ) : (
                  "S'inscrire"
                )}
              </button>
            </div>
          </form>

          {/* Lien connexion */}
          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <p className="text-sm text-gray-600">
              Déjà un compte ?{" "}
              <Link href="/connexion" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
                Connectez-vous
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
