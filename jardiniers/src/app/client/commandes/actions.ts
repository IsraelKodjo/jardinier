"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { commandes } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function confirmOrderReceptionAction(orderId: string) {
  if (!orderId) {
    throw new Error("Identifiant de commande manquant.");
  }

  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    throw new Error("Vous devez être connecté pour valider une commande.");
  }

  const userId = (session.user as any).id;

  // Vérification que la commande appartient bien à ce client
  const existing = await db
    .select()
    .from(commandes)
    .where(and(eq(commandes.id, orderId), eq(commandes.clientId, userId)))
    .limit(1);

  if (existing.length === 0) {
    throw new Error("Commande introuvable ou non autorisée.");
  }

  // Mise à jour du statut vers RECEPTION_VALIDEE
  await db
    .update(commandes)
    .set({ status: "RECEPTION_VALIDEE" })
    .where(eq(commandes.id, orderId));

  // Revalidation en cascade des pages client et admin
  revalidatePath("/client/commandes");
  revalidatePath("/client");
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");

  return { success: true };
}
