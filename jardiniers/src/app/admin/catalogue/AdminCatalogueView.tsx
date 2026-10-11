"use client";

import { useState, useRef } from "react";
import {
  Plus,
  Search,
  Trash2,
  Edit2,
  Image as ImageIcon,
  X,
  Loader2,
  Upload,
  Camera,
} from "lucide-react";
import {
  createCultureAction,
  updateCultureAction,
  toggleCultureAvailabilityAction,
  deleteCultureAction,
} from "./actions";

export interface CultureItem {
  id: string;
  name: string;
  price: number;
  unit: string | null;
  maturationDays: number;
  category: string;
  description: string | null;
  image: string | null;
  available: boolean | null;
}

export default function AdminCatalogueView({ initialCultures }: { initialCultures: CultureItem[] }) {
  const [cultures, setCultures] = useState<CultureItem[]>(initialCultures);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingCulture, setEditingCulture] = useState<CultureItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // URLs d'images pour les modales
  const [previewImageUrl, setPreviewImageUrl] = useState<string>("");
  const [createImageUrl, setCreateImageUrl] = useState<string>("");

  // Références d'input fichiers cachés
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const createFileInputRef = useRef<HTMLInputElement>(null);

  const filteredCultures = initialCultures.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggle = async (id: string, currentStatus: boolean | null) => {
    setCultures((prev) =>
      prev.map((c) => (c.id === id ? { ...c, available: !currentStatus } : c))
    );
    await toggleCultureAvailabilityAction(id, !!currentStatus);
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer définitivement "${name}" du catalogue ?`)) {
      setCultures((prev) => prev.filter((c) => c.id !== id));
      await deleteCultureAction(id);
    }
  };

  // Upload d'image local vers le serveur
  const handleFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "create" | "edit"
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.url) {
        if (type === "edit") {
          setPreviewImageUrl(data.url);
        } else {
          setCreateImageUrl(data.url);
        }
      } else {
        alert(data.error || "Erreur lors du téléversement du fichier.");
      }
    } catch (err) {
      alert("Impossible de téléverser l'image depuis vos fichiers.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    try {
      await createCultureAction(formData);
      setIsCreateModalOpen(false);
      setCreateImageUrl("");
    } catch (err: any) {
      alert(err.message || "Erreur lors de la création.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartEdit = (culture: CultureItem) => {
    setEditingCulture(culture);
    setPreviewImageUrl(culture.image || "");
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingCulture) return;
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    formData.append("id", editingCulture.id);

    try {
      await updateCultureAction(formData);
      setEditingCulture(null);
    } catch (err: any) {
      alert(err.message || "Erreur lors de la modification.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pb-12 font-sans">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Gestion des Cultures & Produits</h1>
          <p className="text-sm text-gray-500">
            Gérez chaque culture individuellement, son prix, sa disponibilité et sa photo depuis vos fichiers.
          </p>
        </div>
        <button
          onClick={() => {
            setCreateImageUrl("");
            setIsCreateModalOpen(true);
          }}
          className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md shadow-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nouvelle culture
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* FILTRES */}
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Rechercher une culture..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="focus:ring-green-500 focus:border-green-500 block w-full pl-9 pr-3 py-2 sm:text-sm border-gray-300 rounded-md border outline-none bg-white text-gray-900"
            />
          </div>
          <div className="text-sm font-medium text-gray-500">
            {filteredCultures.length} culture(s) enregistrée(s)
          </div>
        </div>

        {/* LISTE DES CULTURES */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-white">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Photo & Culture
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Catégorie
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prix au kg (FCFA)
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Délai maturation
                </th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut Public
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCultures.map((culture) => (
                <tr key={culture.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        onClick={() => handleStartEdit(culture)}
                        className="flex-shrink-0 h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center border border-gray-200 overflow-hidden relative shadow-xs cursor-pointer group/img"
                        title="Cliquer pour modifier la photo"
                      >
                        {culture.image ? (
                          <img src={culture.image} alt={culture.name} className="h-full w-full object-cover group-hover/img:scale-105 transition-transform" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-gray-400" />
                        )}
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <Camera className="w-4 h-4" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-bold text-gray-900">{culture.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {culture.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">
                      {culture.price.toLocaleString("fr-FR")} {culture.unit || "FCFA / kg"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-700">{culture.maturationDays} jours</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggle(culture.id, culture.available)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        culture.available ? "bg-green-600" : "bg-gray-300"
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          culture.available ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <span className="block text-[10px] uppercase font-bold text-gray-500 mt-1">
                      {culture.available ? "Disponible" : "Caché"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end items-center gap-2">
                      <button
                        onClick={() => handleStartEdit(culture)}
                        className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                        title="Modifier cette culture"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Modifier</span>
                      </button>
                      <button
                        onClick={() => handleDelete(culture.id, culture.name)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer définitivement"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredCultures.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-gray-500">
                    Aucune culture trouvée dans la base de données.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1 : CRÉATION D'UNE CULTURE */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-4">Ajouter une nouvelle culture</h2>

            {/* Input fichier caché pour création */}
            <input
              type="file"
              ref={createFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "create")}
            />

            <form onSubmit={handleCreate} className="space-y-4">
              {/* SÉLECTEUR DE PHOTO DEPUIS FICHIERS */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Photo du produit
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div
                    onClick={() => createFileInputRef.current?.click()}
                    className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 border border-gray-300 flex items-center justify-center cursor-pointer relative group hover:border-green-500 transition-colors"
                    title="Cliquez pour choisir une photo depuis vos fichiers"
                  >
                    {createImageUrl ? (
                      <img src={createImageUrl} alt="Aperçu" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <Camera className="w-6 h-6 mb-1" />
                        <span className="text-[10px]">Ajouter</span>
                      </div>
                    )}
                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity font-medium">
                        <Upload className="w-4 h-4 mb-0.5" />
                        <span>Fichier</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => createFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-gray-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-gray-500" />
                      <span>Sélectionner depuis mes fichiers</span>
                    </button>
                    <input
                      name="image"
                      type="text"
                      value={createImageUrl}
                      onChange={(e) => setCreateImageUrl(e.target.value)}
                      placeholder="Ou collez un lien URL d'image"
                      className="w-full mt-2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nom de la culture *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  placeholder="Ex: Piments Rouges, Maïs Frais..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prix (FCFA / kg) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="1"
                    placeholder="Ex: 1500"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Maturation (jours) *
                  </label>
                  <input
                    name="maturationDays"
                    type="number"
                    required
                    min="1"
                    placeholder="Ex: 90"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  name="category"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="Légume-fruit">Légume-fruit</option>
                  <option value="Tubercule">Tubercule</option>
                  <option value="Légume-racine">Légume-racine</option>
                  <option value="Bulbe">Bulbe</option>
                  <option value="Feuille">Feuille</option>
                  <option value="Céréale">Céréale</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  placeholder="Description détaillée de la culture..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    "Ajouter au catalogue"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2 : MODIFICATION INDIVIDUELLE D'UNE CULTURE */}
      {editingCulture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 sm:p-8 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setEditingCulture(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <Edit2 className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">
                Modifier : {editingCulture.name}
              </h2>
            </div>

            {/* Input fichier caché pour édition */}
            <input
              type="file"
              ref={editFileInputRef}
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileChange(e, "edit")}
            />

            <form onSubmit={handleUpdate} className="space-y-4">
              {/* PHOTO AVEC SÉLECTION FICHIER DIRECTE AU CLIC */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Photo du produit (Cliquer sur l'image pour changer)
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl border border-gray-200">
                  <div
                    onClick={() => editFileInputRef.current?.click()}
                    className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden shrink-0 border-2 border-dashed border-gray-300 hover:border-blue-500 flex items-center justify-center cursor-pointer relative group transition-all shadow-xs"
                    title="Cliquez sur cette photo pour sélectionner une image depuis vos fichiers"
                  >
                    {previewImageUrl ? (
                      <img
                        src={previewImageUrl}
                        alt="Aperçu"
                        className="w-full h-full object-cover"
                        onError={() => setPreviewImageUrl("")}
                      />
                    ) : (
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    )}

                    {isUploading ? (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[10px] transition-opacity font-bold">
                        <Camera className="w-5 h-5 mb-1" />
                        <span>Changer</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1">
                    <button
                      type="button"
                      onClick={() => editFileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-3 py-1.5 bg-white border border-gray-300 hover:bg-gray-100 rounded-lg text-xs font-semibold text-blue-700 flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      <span>Choisir depuis mes fichiers</span>
                    </button>
                    <input
                      name="image"
                      type="text"
                      value={previewImageUrl}
                      onChange={(e) => setPreviewImageUrl(e.target.value)}
                      placeholder="Ou lien URL de l'image"
                      className="w-full mt-2 px-2.5 py-1.5 border border-gray-300 rounded-lg text-xs bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-[11px] text-gray-500 mt-1">
                      Cliquez directement sur le carré photo ou sur le bouton pour parcourir vos dossiers.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Nom de la culture *
                </label>
                <input
                  name="name"
                  type="text"
                  required
                  defaultValue={editingCulture.name}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Prix (FCFA / kg) *
                  </label>
                  <input
                    name="price"
                    type="number"
                    required
                    min="1"
                    defaultValue={editingCulture.price}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Maturation (jours) *
                  </label>
                  <input
                    name="maturationDays"
                    type="number"
                    required
                    min="1"
                    defaultValue={editingCulture.maturationDays}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    name="category"
                    required
                    defaultValue={editingCulture.category}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Légume-fruit">Légume-fruit</option>
                    <option value="Tubercule">Tubercule</option>
                    <option value="Légume-racine">Légume-racine</option>
                    <option value="Bulbe">Bulbe</option>
                    <option value="Feuille">Feuille</option>
                    <option value="Céréale">Céréale</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Statut de vente *
                  </label>
                  <select
                    name="available"
                    defaultValue={editingCulture.available ? "true" : "false"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="true">Disponible à la commande</option>
                    <option value="false">Indisponible (Caché)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  rows={3}
                  defaultValue={editingCulture.description || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingCulture(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isUploading}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg flex items-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Mise à jour...
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
