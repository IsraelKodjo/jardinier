import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

// Utiliser DATABASE_URL d'environnement, ou fallback safe pour la phase de build Docker
const databaseUrl =
  process.env.DATABASE_URL || "mysql://root:password@localhost:3306/jardiniers";

// Création du pool de connexion MySQL
const poolConnection = mysql.createPool({
  uri: databaseUrl,
});

// Initialisation de Drizzle ORM
export const db = drizzle(poolConnection, { schema, mode: "default" });
