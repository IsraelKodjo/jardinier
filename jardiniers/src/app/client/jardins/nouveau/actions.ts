"use server";

import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/db";
import { jardins } from "@/db/schema";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createJardin(formData: FormData) {
  // 1. Vérification de la session
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    throw new Error("Vous devez être connecté pour ajouter un jardin.");
  }

  const userId = (session.user as any).id;
  
  // 2. Extraction des données du formulaire
  const name = formData.get("name") as string;
  const description = formData.get("description") as string | null;
  const address = formData.get("address") as string | null;
  const surface = formData.get("surface") as string;

  if (!name || name.trim() === "") {
    throw new Error("Le nom du jardin est requis.");
  }

  // 3. Insertion dans la base de données via Drizzle ORM
  await db.insert(jardins).values({
    ownerId: userId,
    name: name.trim(),
    description: description ? description.trim() : null,
    address: address ? address.trim() : null,
    surface: surface ? parseInt(surface, 10) : null,
  });

  // 4. Invalidation du cache pour mettre à jour la page Dashboard
  revalidatePath("/client"); 
  
  // 5. Redirection vers le dashboard
  redirect("/client");
}
