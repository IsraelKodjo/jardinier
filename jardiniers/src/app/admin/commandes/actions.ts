"use server";

import { db } from "@/db";
import { commandes } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  if (!orderId || !newStatus) {
    throw new Error("Paramètres manquants.");
  }

  await db
    .update(commandes)
    .set({ status: newStatus })
    .where(eq(commandes.id, orderId));

  // Revalidation en cascade des vues client et admin
  revalidatePath("/admin/commandes");
  revalidatePath("/admin");
  revalidatePath("/client/commandes");
  revalidatePath("/client");

  return { success: true };
}
