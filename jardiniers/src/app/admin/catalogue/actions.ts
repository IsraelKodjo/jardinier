"use server";

import { db } from "@/db";
import { cultures } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createCultureAction(formData: FormData) {
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const unit = (formData.get("unit") as string) || "FCFA / kg";
  const maturationDays = formData.get("maturationDays") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;

  if (!name || !price || !maturationDays || !category) {
    throw new Error("Veuillez renseigner tous les champs obligatoires.");
  }

  // Générer un identifiant unique (ex: C-123456)
  const id = `C-${Date.now()}`;

  await db.insert(cultures).values({
    id,
    name: name.trim(),
    price: parseInt(price, 10),
    unit,
    maturationDays: parseInt(maturationDays, 10),
    category,
    description: description ? description.trim() : null,
    image: image ? image.trim() : "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
    available: true,
  });

  // Rafraîchir les chemins du cache Next.js
  revalidatePath("/admin/catalogue");
  revalidatePath("/client/catalogue");
  revalidatePath("/client/commande/nouvelle");
  revalidatePath("/client");

  return { success: true };
}

export async function toggleCultureAvailabilityAction(id: string, currentStatus: boolean) {
  await db
    .update(cultures)
    .set({ available: !currentStatus })
    .where(eq(cultures.id, id));

  revalidatePath("/admin/catalogue");
  revalidatePath("/client/catalogue");
  revalidatePath("/client");

  return { success: true };
}

export async function deleteCultureAction(id: string) {
  await db.delete(cultures).where(eq(cultures.id, id));

  revalidatePath("/admin/catalogue");
  revalidatePath("/client/catalogue");
  revalidatePath("/client/commande/nouvelle");
  revalidatePath("/client");

  return { success: true };
}

export async function updateCultureAction(formData: FormData) {
  const id = formData.get("id") as string;
  const name = formData.get("name") as string;
  const price = formData.get("price") as string;
  const unit = (formData.get("unit") as string) || "FCFA / kg";
  const maturationDays = formData.get("maturationDays") as string;
  const category = formData.get("category") as string;
  const description = formData.get("description") as string;
  const image = formData.get("image") as string;
  const available = formData.get("available") === "true";

  if (!id || !name || !price || !maturationDays || !category) {
    throw new Error("Veuillez renseigner tous les champs obligatoires.");
  }

  await db
    .update(cultures)
    .set({
      name: name.trim(),
      price: parseInt(price, 10),
      unit,
      maturationDays: parseInt(maturationDays, 10),
      category,
      description: description ? description.trim() : null,
      image: image ? image.trim() : null,
      available,
    })
    .where(eq(cultures.id, id));

  revalidatePath("/admin/catalogue");
  revalidatePath("/client/catalogue");
  revalidatePath("/client/commande/nouvelle");
  revalidatePath("/client");

  return { success: true };
}
