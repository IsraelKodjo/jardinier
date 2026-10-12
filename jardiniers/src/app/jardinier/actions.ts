"use server";

import { db } from "@/db";
import { parcelles, productions, cultures, users } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// 1. Récupérer l'ID du jardinier connecté
async function getConnectedJardinierId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as any)?.id || null;
}

// 2. Récupérer toutes les parcelles du jardinier connecté
export async function getJardinierParcellesAction() {
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) return [];

  try {
    const userParcelles = await db
      .select()
      .from(parcelles)
      .where(eq(parcelles.jardinierId, jardinierId))
      .orderBy(desc(parcelles.createdAt));

    return userParcelles;
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
  const jardinierId = await getConnectedJardinierId();
  if (!jardinierId) {
    return { success: false, error: "Vous devez être connecté pour déclarer une parcelle." };
  }

  try {
    const year = new Date().getFullYear();
    const randomCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const id = `PARC-${year}-${randomCode}`;

    await db.insert(parcelles).values({
      id,
      jardinierId,
      location: data.location || "Parcelle Agricole (GPS)",
      surface: data.surface || "1.0",
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
        status: productions.status,
        createdAt: productions.createdAt,
      })
      .from(productions)
      .leftJoin(parcelles, eq(productions.parcelleId, parcelles.id))
      .where(eq(productions.jardinierId, jardinierId))
      .orderBy(desc(productions.createdAt));

    return userProductions;
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
}) {
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
