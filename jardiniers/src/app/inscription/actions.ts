"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { redirect } from "next/navigation";

export async function registerUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: string;
}) {
  try {
    const name = data.name?.trim();
    const email = data.email?.trim().toLowerCase();
    const password = data.password;
    const role = data.role || "client";

    if (!name || !email || !password) {
      return { success: false, error: "Tous les champs sont obligatoires." };
    }

    if (password.length < 6) {
      return { success: false, error: "Le mot de passe doit contenir au moins 6 caractères." };
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
      return {
        success: false,
        error: "Un compte avec cette adresse email existe déjà. Veuillez vous connecter.",
      };
    }

    // Hachage du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const id = crypto.randomUUID();

    // Insertion en BDD
    await db.insert(users).values({
      id,
      name,
      email,
      password: hashedPassword,
      role,
    });

    return { success: true };
  } catch (err: any) {
    console.error("Erreur registerUserAction :", err);
    return {
      success: false,
      error: err?.message || "Une erreur est survenue lors de l'enregistrement.",
    };
  }
}

// Fallback pour compatibilité formulaire standard
export async function registerUser(formData: FormData) {
  const name = formData.get("name") as string;
  const email = (formData.get("email") as string || "").trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = (formData.get("role") as string) || "client";

  const res = await registerUserAction({ name, email, password, role });
  if (res.success) {
    redirect("/connexion");
  } else {
    redirect(`/inscription?error=${encodeURIComponent(res.error || "")}`);
  }
}
