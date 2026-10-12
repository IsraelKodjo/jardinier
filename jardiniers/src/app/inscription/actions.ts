"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import crypto from "crypto";

export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as string || "client"; // client ou jardinier

  if (!email || !password || !name) {
    throw new Error("Tous les champs sont obligatoires.");
  }

  // S'assurer que la base est initialisée
  try {
    const { ensureDatabaseInitialized } = await import("@/db/init");
    await ensureDatabaseInitialized();
  } catch (e) {
    console.error("Init DB dans inscription :", e);
  }

  // Vérifier si l'utilisateur existe déjà
  const existingUsers = await db.select().from(users).where(eq(users.email, email));
  if (existingUsers.length > 0) {
    throw new Error("Un utilisateur avec cet email existe déjà.");
  }

  // Hachage du mot de passe
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const id = crypto.randomUUID(); // Génération d'un UUID unique pour l'ID

  // Insertion en BDD
  await db.insert(users).values({
    id,
    name,
    email,
    password: hashedPassword,
    role,
  });

  redirect("/connexion");
}
