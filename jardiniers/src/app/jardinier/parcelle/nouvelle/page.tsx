"use client";

import { useState } from "react";
import { ArrowLeft, MapPin, Play, CheckCircle2, Navigation, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createParcelleAction } from "../../actions";

type GpsStatus = "IDLE" | "LOCATING" | "ACQUIRED" | "SAVING";

export default function NouvelleParcelle() {
  const router = useRouter();
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("IDLE");
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [locationName, setLocationName] = useState("");
  const [surface, setSurface] = useState("1.0");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Déclencher la géolocalisation réelle
  const handleAcquireGps = () => {
    setGpsStatus("LOCATING");
    setErrorMessage(null);

    if (!navigator.geolocation) {
      setErrorMessage("La géolocalisation n'est pas supportée par votre navigateur.");
      setGpsStatus("IDLE");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: Number(position.coords.latitude.toFixed(6)),
          lng: Number(position.coords.longitude.toFixed(6)),
          accuracy: Math.round(position.coords.accuracy),
        });
        setGpsStatus("ACQUIRED");
      },
      (err) => {
        console.warn("Erreur géolocalisation :", err.message);
        // Fallback avec coordonnées par défaut si l'utilisateur refuse ou est hors réseau
        setCoords({ lat: 6.1375, lng: 1.2123, accuracy: 15 });
        setGpsStatus("ACQUIRED");
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName) {
      setErrorMessage("Veuillez renseigner un nom ou lieu pour la parcelle.");
      return;
    }

    setGpsStatus("SAVING");
    setErrorMessage(null);

    const res = await createParcelleAction({
      location: locationName,
      surface: surface || "1.0",
      lat: coords?.lat ? String(coords.lat) : undefined,
      lng: coords?.lng ? String(coords.lng) : undefined,
      coordinates: coords ? `POINT(${coords.lng} ${coords.lat})` : undefined,
    });

    if (res.success) {
      router.push("/jardinier/parcelles");
      router.refresh();
    } else {
      setErrorMessage(res.error || "Impossible d'enregistrer la parcelle.");
      setGpsStatus("ACQUIRED");
    }
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 font-sans">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/jardinier/parcelles"
          className="p-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
            Déclarer une Parcelle Agricole
          </h1>
          <p className="text-sm text-gray-500">
            Enregistrement des coordonnées GPS et de la surface dans la base de données.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50">
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-green-600" />
            Coordonnées & Informations du terrain
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Activez la géolocalisation sur le terrain pour lier votre parcelle à son emplacement exact.
          </p>
        </div>

        {errorMessage && (
          <div className="m-6 mb-0 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {/* Bloc GPS */}
          <div className="bg-emerald-50/50 rounded-2xl border border-emerald-100 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase font-bold text-emerald-800 tracking-wider">
                Relevé GPS
              </span>
              {coords && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  Précision : ±{coords.accuracy} m
                </span>
              )}
            </div>

            {gpsStatus === "IDLE" && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-600 mb-4">
                  Cliquez ci-dessous pour capturer la position GPS actuelle de votre terrain.
                </p>
                <button
                  type="button"
                  onClick={handleAcquireGps}
                  className="bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 px-6 rounded-xl shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <Navigation className="w-4 h-4 text-emerald-400" />
                  Capturer ma position GPS
                </button>
              </div>
            )}

            {gpsStatus === "LOCATING" && (
              <div className="text-center py-6">
                <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-2" />
                <p className="text-sm font-semibold text-gray-800">Acquisition des satellites GPS en cours...</p>
                <p className="text-xs text-gray-500 mt-1">Veuillez autoriser l'accès à votre position si demandé.</p>
              </div>
            )}

            {(gpsStatus === "ACQUIRED" || gpsStatus === "SAVING") && coords && (
              <div className="bg-white rounded-xl p-4 border border-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <span className="block text-xs font-semibold text-gray-500 uppercase">Coordonnées fixées</span>
                    <span className="text-sm font-mono font-bold text-gray-900">
                      Latitude: {coords.lat} | Longitude: {coords.lng}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAcquireGps}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold underline cursor-pointer"
                >
                  Réactualiser
                </button>
              </div>
            )}
          </div>

          {/* Formulaire des métadonnées de la parcelle */}
          <div className="space-y-4">
            <div>
              <label htmlFor="locationName" className="block text-sm font-semibold text-gray-700 mb-1">
                Nom ou Désignation de la parcelle *
              </label>
              <input
                id="locationName"
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="Ex : Parcelle Nord - Kpalimé"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
              />
            </div>

            <div>
              <label htmlFor="surface" className="block text-sm font-semibold text-gray-700 mb-1">
                Surface de la parcelle (Hectares) *
              </label>
              <input
                id="surface"
                type="number"
                step="0.1"
                min="0.1"
                required
                value={surface}
                onChange={(e) => setSurface(e.target.value)}
                placeholder="Ex : 2.5"
                className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm text-gray-900 outline-none"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
            <Link
              href="/jardinier/parcelles"
              className="px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors text-sm"
            >
              Annuler
            </Link>
            <button
              type="submit"
              disabled={gpsStatus === "SAVING"}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-6 rounded-xl shadow-sm transition-colors text-sm flex items-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {gpsStatus === "SAVING" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Enregistrement en base...
                </>
              ) : (
                "Valider et enregistrer ma parcelle"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
