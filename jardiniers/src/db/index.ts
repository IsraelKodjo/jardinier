import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Vérifier que l'URL de la base de données est définie (évite les erreurs silencieuses)
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the environment variables");
}

// Création du pool de connexion MySQL
const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL,
});

// Initialisation de Drizzle ORM
export const db = drizzle(poolConnection, { schema, mode: "default" });
