"use client";

import { useState } from "react";
import { Leaf, Mail, Lock, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";

export default function Connexion() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    const emailInput = (document.getElementById("email") as HTMLInputElement)?.value?.trim() || "";
    const passwordInput = (document.getElementById("password") as HTMLInputElement)?.value || "";

    try {
      // 🔐 Véritable authentification NextAuth liée à MySQL
      const result = await signIn("credentials", {
        redirect: false,
        email: emailInput,
        password: passwordInput,
      });

      if (result?.error) {
        setErrorMessage("Adresse e-mail ou mot de passe incorrect.");
        setIsLoading(false);
        return;
      }

      // Récupération de la session pour orienter selon le rôle
      const session = await getSession();
      const userRole = (session?.user as any)?.role;

      let targetPath = "/client";
      if (userRole === "admin") {
        targetPath = "/admin";
      } else if (userRole === "jardinier") {
        targetPath = "/jardinier";
      } else if (userRole === "controleur") {
        targetPath = "/controleur";
      }

      // Redirection et rechargement de l'arbre serveur
      router.push(targetPath);
      router.refresh();
    } catch (err) {
      setErrorMessage("Une erreur inattendue est survenue lors de la connexion.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-90 transition-opacity">
          <div className="bg-green-600 p-2.5 rounded-xl shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-extrabold text-gray-900 tracking-tight">Jardiniers</span>
        </Link>
        <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 tracking-tight">
          Connectez-vous à votre compte
        </h2>
        <p className="mt-1 text-center text-sm text-gray-600">
          Ou{" "}
          <Link href="/inscription" className="font-semibold text-green-600 hover:text-green-500 transition-colors">
            créez un compte gratuitement
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl sm:px-10 border border-gray-200">
          
          {/* Message d'erreur dynamique */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-lg bg-red-50 border border-red-200 flex items-start gap-3 text-red-700 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
                Adresse e-mail
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                  placeholder="nom@exemple.com"
                />
              </div>
            </div>

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
                  autoComplete="current-password"
                  required
                  className="block w-full pl-10 pr-3 py-2.5 bg-white text-gray-900 border border-gray-300 rounded-lg placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm transition-all"
                  placeholder="••••••••••••"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Se souvenir de moi
                </label>
              </div>

              <div className="text-sm">
                <a href="#" className="font-medium text-green-600 hover:text-green-500 transition-colors">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center border-t border-gray-100 pt-5">
            <Link
              href="/"
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
