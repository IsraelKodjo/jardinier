"use server";

import { db } from "@/db";
import { parcelles, productions, cultures, users, traitements } from "@/db/schema";
import { eq, desc, and, asc } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Récupérer l'ID du jardinier connecté
async function getConnectedJardinierId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id || null;
}

async function ensureInit() {
  try {
    const { ensureDatabaseInitialized } = await import("@/db/init");
    await ensureDatabaseInitialized();
  } catch (e) {
    console.error("Init DB jardinier action :", e);
  }
}

// 2. Récupérer toutes les parcelles du jardinier connecté avec le suivi multi-cultures
export async function getJardinierParcellesAction() {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return [];

  try {
    const userParcelles = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.jardinierId, jardinierId))
      .orderBy(desc(parcelles.createdAt));

    const userProductions = await db
      .select()
      .from(productions)
      .where(eq(productions.jardinierId, jardinierId));

    return userParcelles.map((p) => {
      const activeProds = userProductions.filter((pr) => pr.parcelleId === p.id);
      const usedSurfaceHa = activeProds.reduce((acc, curr) => {
        const s = parseFloat(curr.surfaceUtilisee.replace(",", "."));
        return acc + (isNaN(s) ? 0 : s);
      }, 0);
      const totalSurfaceHa = parseFloat(p.surface.replace(",", ".")) || 0;
      const remainingSurfaceHa = Math.max(0, totalSurfaceHa - usedSurfaceHa);

      return {
        ...p,
        productions: activeProds,
        culturesCount: activeProds.length,
        usedSurface: Number(usedSurfaceHa.toFixed(2)),
        remainingSurface: Number(remainingSurfaceHa.toFixed(2)),
      };
    });
  } catch (error) {
    console.error("Erreur getJardinierParcellesAction :", error);
    return [];
  }
}

// 3. Créer une nouvelle parcelle avec localisation GPS
export async function createParcelleAction(data: {
  location: string;
  surface: string;
  lat?: string;
  lng?: string;
  coordinates?: string;
}) {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) {
    return { success: false, error: "Vous devez être connecté pour déclarer une parcelle." };
  }

  try {
    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = `PARC-${year}-${randomCode}`;
    const cleanSurface = (data.surface || "1.0").replace(",", ".");

    await db.insert(parcelles).values({
      id,
      jardinierId,
      location: data.location || "Parcelle Agricole (GPS)",
      surface: cleanSurface,
      lat: data.lat || null,
      lng: data.lng || null,
      coordinates: data.coordinates || null,
      status: "VALIDEE", // Prête pour la production
    });

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/parcelles");
    return { success: true, parcelleId: id };
  } catch (error: any) {
    console.error("Erreur createParcelleAction :", error);
    return { success: false, error: error?.message || "Impossible d'enregistrer la parcelle." };
  }
}

// 4. Supprimer une parcelle
export async function deleteParcelleAction(parcelleId: string) {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return { success: false, error: "Non autorisé" };

  try {
    await db
      .delete(parcelles)
      .where(and(eq(parcelles.id, parcelleId), eq(parcelles.jardinierId, jardinierId)));

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/parcelles");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteParcelleAction :", error);
    return { success: false, error: error?.message };
  }
}

// 5. Récupérer toutes les productions du jardinier
export async function getJardinierProductionsAction() {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return [];

  try {
    const userProductions = await db
      .select({
        id: productions.id,
        parcelleId: productions.parcelleId,
        parcelleLocation: parcelles.location,
        cultureId: productions.cultureId,
        cultureName: productions.cultureName,
        surfaceUtilisee: productions.surfaceUtilisee,
        rendementEstime: productions.rendementEstime,
        dateSemis: productions.dateSemis,
        dateDispo: productions.dateDispo,
        image: productions.image,
        status: productions.status,
        createdAt: productions.createdAt,
      })
      .from(productions)
      .leftJoin(parcelles, eq(productions.parcelleId, parcelles.id))
      .where(eq(productions.jardinierId, jardinierId))
      .orderBy(desc(productions.createdAt));

    const userTraitements = await db
      .select()
      .from(traitements)
      .where(eq(traitements.jardinierId, jardinierId));

    return userProductions.map((p) => {
      const prodTraitements = userTraitements.filter((t) => t.productionId === p.id);
      return {
        ...p,
        traitementsCount: prodTraitements.length,
        pendingTraitementsCount: prodTraitements.filter((t) => t.status === "PLANIFIE").length,
      };
    });
  } catch (error) {
    console.error("Erreur getJardinierProductionsAction :", error);
    return [];
  }
}

// 6. Créer une nouvelle production
export async function createProductionAction(data: {
  parcelleId: string;
  cultureId: string;
  cultureName: string;
  surfaceUtilisee: string;
  rendementEstime: number;
  dateSemis: string;
  dateDispo: string;
  image?: string;
}) {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) {
    return { success: false, error: "Vous devez être connecté pour publier une culture." };
  }

  try {
    const id = `PROD-${Date.now().toString(36).toUpperCase()}`;

    await db.insert(productions).values({
      id,
      jardinierId,
      parcelleId: data.parcelleId,
      cultureId: data.cultureId,
      cultureName: data.cultureName,
      surfaceUtilisee: data.surfaceUtilisee,
      rendementEstime: Number(data.rendementEstime) || 0,
      dateSemis: data.dateSemis,
      dateDispo: data.dateDispo,
      image: data.image || null,
      status: "EN_COURS",
    });

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    return { success: true, productionId: id };
  } catch (error: any) {
    console.error("Erreur createProductionAction :", error);
    return { success: false, error: error?.message || "Impossible d'enregistrer la production." };
  }
}

// 7. Supprimer une production
export async function deleteProductionAction(productionId: string) {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return { success: false, error: "Non autorisé" };

  try {
    await db
      .delete(productions)
      .where(and(eq(productions.id, productionId), eq(productions.jardinierId, jardinierId)));

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteProductionAction :", error);
    return { success: false, error: error?.message };
  }
}

// 8. Récupérer les cultures disponibles du catalogue pour le formulaire
export async function getCatalogueCulturesForJardinierAction() {
  try {
    return await db.select().from(cultures).where(eq(cultures.available, true));
  } catch (error) {
    console.error("Erreur getCatalogueCulturesForJardinierAction :", error);
    return [];
  }
}

// 9. Récupérer les statistiques globales du tableau de bord
export async function getJardinierDashboardStatsAction() {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) {
    return {
      parcellesCount: 0,
      totalSurface: "0",
      productionsCount: 0,
      totalRendementKg: 0,
      recentParcelles: [],
      recentProductions: [],
    };
  }

  try {
    const userParcelles = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.jardinierId, jardinierId))
      .orderBy(desc(parcelles.createdAt));

    const userProductions = await db
      .select()
      .from(productions)
      .where(eq(productions.jardinierId, jardinierId))
      .orderBy(desc(productions.createdAt));

    let totalSurfaceHa = 0;
    for (const p of userParcelles) {
      const val = parseFloat(p.surface);
      if (!isNaN(val)) totalSurfaceHa += val;
    }

    let totalRendementKg = 0;
    for (const pr of userProductions) {
      totalRendementKg += pr.rendementEstime || 0;
    }

    return {
      parcellesCount: userParcelles.length,
      totalSurface: totalSurfaceHa.toFixed(1),
      productionsCount: userProductions.length,
      totalRendementKg,
      recentParcelles: userParcelles.slice(0, 3),
      recentProductions: userProductions.slice(0, 3),
    };
  } catch (error) {
    console.error("Erreur getJardinierDashboardStatsAction :", error);
    return {
      parcellesCount: 0,
      totalSurface: "0",
      productionsCount: 0,
      totalRendementKg: 0,
      recentParcelles: [],
      recentProductions: [],
    };
  }
}

// 10. Récupérer tous les traitements phytosanitaires d'une production
export async function getProductionTraitementsAction(productionId: string) {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return [];

  try {
    return await db
      .select()
      .from(traitements)
      .where(and(eq(traitements.productionId, productionId), eq(traitements.jardinierId, jardinierId)))
      .orderBy(asc(traitements.dateTraitement));
  } catch (error) {
    console.error("Erreur getProductionTraitementsAction :", error);
    return [];
  }
}

// 11. Récupérer tous les traitements phytosanitaires du jardinier pour le calendrier global
export async function getAllJardinierTraitementsAction() {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return [];

  try {
    const list = await db
      .select({
        id: traitements.id,
        productionId: traitements.productionId,
        dateTraitement: traitements.dateTraitement,
        produit: traitements.produit,
        typeProduit: traitements.typeProduit,
        cible: traitements.cible,
        dosage: traitements.dosage,
        stade: traitements.stade,
        delaiAvantRecolteJours: traitements.delaiAvantRecolteJours,
        status: traitements.status,
        notes: traitements.notes,
        createdAt: traitements.createdAt,
        cultureName: productions.cultureName,
        dateSemis: productions.dateSemis,
        dateDispo: productions.dateDispo,
        image: productions.image,
        parcelleId: productions.parcelleId,
        parcelleLocation: parcelles.location,
      })
      .from(traitements)
      .innerJoin(productions, eq(traitements.productionId, productions.id))
      .leftJoin(parcelles, eq(productions.parcelleId, parcelles.id))
      .where(eq(traitements.jardinierId, jardinierId))
      .orderBy(asc(traitements.dateTraitement));

    return list;
  } catch (error) {
    console.error("Erreur getAllJardinierTraitementsAction :", error);
    return [];
  }
}

// 12. Créer un traitement phytosanitaire (Pesticide date par date)
export async function createTraitementAction(data: {
  productionId: string;
  dateTraitement: string;
  produit: string;
  typeProduit?: string;
  cible?: string;
  dosage?: string;
  stade?: string;
  delaiAvantRecolteJours?: number;
  status?: string;
  notes?: string;
}) {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) {
    return { success: false, error: "Vous devez être connecté pour planifier un traitement." };
  }

  try {
    const id = `TRT-${Date.now().toString(36).toUpperCase()}`;

    await db.insert(traitements).values({
      id,
      productionId: data.productionId,
      jardinierId,
      dateTraitement: data.dateTraitement,
      produit: data.produit,
      typeProduit: data.typeProduit || "Insecticide",
      cible: data.cible || null,
      dosage: data.dosage || null,
      stade: data.stade || null,
      delaiAvantRecolteJours: Number(data.delaiAvantRecolteJours) || 0,
      status: data.status || "PLANIFIE",
      notes: data.notes || null,
    });

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    revalidatePath("/jardinier/calendrier");
    return { success: true, traitementId: id };
  } catch (error: any) {
    console.error("Erreur createTraitementAction :", error);
    return { success: false, error: error?.message || "Impossible d'enregistrer le traitement." };
  }
}

// 13. Mettre à jour le statut d'un traitement (ex: Marquer comme Effectué)
export async function updateTraitementStatusAction(traitementId: string, status: "PLANIFIE" | "EFFECTUE" | "REPORTE") {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return { success: false, error: "Non autorisé" };

  try {
    await db
      .update(traitements)
      .set({ status })
      .where(and(eq(traitements.id, traitementId), eq(traitements.jardinierId, jardinierId)));

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    revalidatePath("/jardinier/calendrier");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur updateTraitementStatusAction :", error);
    return { success: false, error: error?.message };
  }
}

// 14. Supprimer un traitement
export async function deleteTraitementAction(traitementId: string) {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return { success: false, error: "Non autorisé" };

  try {
    await db
      .delete(traitements)
      .where(and(eq(traitements.id, traitementId), eq(traitements.jardinierId, jardinierId)));

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    revalidatePath("/jardinier/calendrier");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur deleteTraitementAction :", error);
    return { success: false, error: error?.message };
  }
}

// 15. Générer un calendrier prévisionnel de traitements pour une production
export async function generatePrevisionalTraitementsAction(productionId: string) {
  await ensureInit();
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return { success: false, error: "Non autorisé" };

  try {
    const [prod] = await db
      .select()
      .from(productions)
      .where(and(eq(productions.id, productionId), eq(productions.jardinierId, jardinierId)));

    if (!prod || !prod.dateSemis) {
      return { success: false, error: "Production ou date de semis introuvable." };
    }

    const startDate = new Date(prod.dateSemis);
    const addDays = (d: Date, days: number) => {
      const copy = new Date(d);
      copy.setDate(copy.getDate() + days);
      return copy.toISOString().split("T")[0];
    };

    const defaultProgram = [
      {
        days: 7,
        stade: "Levée & Enracinement",
        produit: "Purin d'ortie / Ail-Piment macéré (Bio)",
        typeProduit: "Répulsif bio & Fongicide naturel",
        cible: "Fonte des semis & ravageurs du sol (taupins, vers gris)",
        dosage: "1 L pour 10 L d'eau en arrosage au pied",
        delaiAvantRecolteJours: 0,
        notes: "Application douce au pied des jeunes plantules le matin tôt.",
      },
      {
        days: 21,
        stade: "Croissance végétative",
        produit: "Huile de Neem pure (Azadirachtine)",
        typeProduit: "Insecticide biologique",
        cible: "Pucerons, aleurodes (mouches blanches) & thrips",
        dosage: "30 ml dans 15 L d'eau + 1 cuillère savon noir",
        delaiAvantRecolteJours: 3,
        notes: "Pulvériser sous les feuilles en fin d'après-midi hors fort ensoleillement.",
      },
      {
        days: 38,
        stade: "Pré-floraison",
        produit: "Bouillie Bordelaise (Sulfate de cuivre)",
        typeProduit: "Fongicide minéral préventif",
        cible: "Mildiou, alternariose et bactérioses foliaires",
        dosage: "120 g dans 10 L d'eau",
        delaiAvantRecolteJours: 5,
        notes: "Traitement protecteur préventif avant l'apparition des fleurs ouvertes.",
      },
      {
        days: 55,
        stade: "Nouaison & Fructification",
        produit: "Bacillus thuringiensis (Bt)",
        typeProduit: "Bio-insecticide sélectif",
        cible: "Chenilles défoliatrices, noctuelles et foreuses de fruits",
        dosage: "20 g dans 10 L d'eau",
        delaiAvantRecolteJours: 1,
        notes: "Très sélectif, respecte les pollinisateurs et les abeilles.",
      },
      {
        days: 72,
        stade: "Grossissement des fruits",
        produit: "Savon noir potassique + Huile de Neem",
        typeProduit: "Insecticide & Acaricide de contact",
        cible: "Acariens tétranyques, cochenilles & pucerons tardifs",
        dosage: "25 ml Neem + 30 ml Savon noir pour 10 L d'eau",
        delaiAvantRecolteJours: 3,
        notes: "Dernière protection avant maturation. Respecter le délai de 3 jours.",
      },
    ];

    for (const item of defaultProgram) {
      const treatmentDate = addDays(startDate, item.days);
      const id = `TRT-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

      await db.insert(traitements).values({
        id,
        productionId: prod.id,
        jardinierId,
        dateTraitement: treatmentDate,
        produit: item.produit,
        typeProduit: item.typeProduit,
        cible: item.cible,
        dosage: item.dosage,
        stade: item.stade,
        delaiAvantRecolteJours: item.delaiAvantRecolteJours,
        status: "PLANIFIE",
        notes: item.notes,
      });
    }

    revalidatePath("/jardinier");
    revalidatePath("/jardinier/cultures");
    revalidatePath("/jardinier/calendrier");
    return { success: true };
  } catch (error: any) {
    console.error("Erreur generatePrevisionalTraitementsAction :", error);
    return { success: false, error: error?.message || "Erreur lors de la génération." };
  }
}
