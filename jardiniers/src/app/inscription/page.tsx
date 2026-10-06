"use client";

import { useState } from "react";
import { Leaf, Mail, Lock, User, Tractor, ShieldCheck, CheckCircle2, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "client" | "jardinier" | "controleur";

export default function Inscription() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("client");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulation d'inscription et d'attente de validation
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      
      // Redirection après succès
      setTimeout(() => {
        router.push("/connexion");
      }, 3000);
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-12 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Inscription réussie !</h2>
            <p className="text-gray-600 mb-6">
              Votre demande de compte <span className="font-bold">{role}</span> a bien été enregistrée.
              <br /><br />
              Un administrateur va examiner votre profil et valider votre accès très prochainement.
            </p>
            <p className="text-sm text-gray-400">Redirection vers la page de connexion...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link href="/" className="flex items-center justify-center gap-2 mb-6 hover:opacity-90 transition-opacity">
          <div className="bg-green-600 p-2 rounded-lg shadow-sm">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-3xl font-bold text-gray-900 tracking-tight">Jardiniers</span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900 tracking-tight">
          Créer un compte
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Vous avez déjà un compte ?{" "}
          <Link href="/connexion" className="font-medium text-green-600 hover:text-green-500 transition-colors">
            Connectez-vous ici
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-gray-100">
          
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
              Je souhaite m'inscrire en tant que :
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setRole("client")}
                className={`relative flex flex-col items-center p-4 border rounded-xl transition-all ${
                  role === "client" 
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600" 
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                {role === "client" && <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-2 right-2" />}
                <User className={`w-6 h-6 mb-2 ${role === "client" ? "text-green-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${role === "client" ? "text-green-900" : "text-gray-700"}`}>Client</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("jardinier")}
                className={`relative flex flex-col items-center p-4 border rounded-xl transition-all ${
                  role === "jardinier" 
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600" 
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                {role === "jardinier" && <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-2 right-2" />}
                <Tractor className={`w-6 h-6 mb-2 ${role === "jardinier" ? "text-green-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${role === "jardinier" ? "text-green-900" : "text-gray-700"}`}>Jardinier</span>
              </button>

              <button
                type="button"
                onClick={() => setRole("controleur")}
                className={`relative flex flex-col items-center p-4 border rounded-xl transition-all ${
                  role === "controleur" 
                    ? "border-green-600 bg-green-50 ring-1 ring-green-600" 
                    : "border-gray-200 hover:border-green-300 hover:bg-gray-50"
                }`}
              >
                {role === "controleur" && <CheckCircle2 className="w-4 h-4 text-green-600 absolute top-2 right-2" />}
                <ShieldCheck className={`w-6 h-6 mb-2 ${role === "controleur" ? "text-green-600" : "text-gray-500"}`} />
                <span className={`text-sm font-medium ${role === "controleur" ? "text-green-900" : "text-gray-700"}`}>Contrôleur</span>
              </button>
            </div>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* CHAMPS COMMUNS */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="prenom" className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 px-3 border outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Jean"
                />
              </div>
              <div>
                <label htmlFor="nom" className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  className="mt-1 focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md py-2.5 px-3 border outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="Dupont"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Adresse e-mail
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="vous@exemple.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Mot de passe
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="focus:ring-green-500 focus:border-green-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-2.5 border outline-none transition-colors text-gray-900 placeholder-gray-400 bg-white"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* CHAMPS SPECIFIQUES JARDINIER */}
            {role === "jardinier" && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mt-6">
                <h4 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-green-600" />
                  Vérification d'identité requise
                </h4>
                <p className="text-xs text-gray-500 mb-4">
                  Pour valider votre compte Jardinier, l'administration doit vérifier votre identité.
                </p>
                <div>
                  <label htmlFor="id_card" className="block text-sm font-medium text-gray-700">
                    Copie de pièce d'identité (PDF, JPG, PNG)
                  </label>
                  <input
                    id="id_card"
                    name="id_card"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    required={role === "jardinier"}
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 transition-colors"
                  />
                </div>
              </div>
            )}

            <div className="pt-2">
              <p className="text-xs text-gray-500 text-center mb-4">
                En vous inscrivant, vous acceptez que votre compte soit soumis à validation par un administrateur.
              </p>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Création en cours...
                  </>
                ) : (
                  "Créer mon compte"
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
