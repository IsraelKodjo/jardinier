"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { commandes } from "@/db/schema";
import { revalidatePath } from "next/cache";

export interface CommandeInput {
  cultureId: string;
  cultureName: string;
  quantite: number;
  dateLivraison: string;
  adresseLivraison: string;
  emballage: string;
  dateLancement?: string;
  quantiteComplementaire?: string;
}

export async function createCommandeAction(data: CommandeInput) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Vous devez être connecté pour passer une commande.");
  }

  const userId = (session.user as any).id;

  // Génération d'un identifiant lisible : CMD-2026-XXXX
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  const orderId = `CMD-2026-${randomSuffix}`;

  await db.insert(commandes).values({
    id: orderId,
    clientId: userId,
    cultureId: data.cultureId,
    cultureName: data.cultureName,
    quantite: data.quantite,
    dateLivraison: data.dateLivraison,
    adresseLivraison: data.adresseLivraison,
    emballage: data.emballage || "Carton standard",
    status: "EN_ATTENTE",
    dateLancement: data.dateLancement || null,
    quantiteComplementaire: data.quantiteComplementaire || null,
  });

  revalidatePath("/client");
  revalidatePath("/client/commandes");

  return { success: true, orderId };
}
