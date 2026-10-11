import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const databaseUrl =
  process.env.DATABASE_URL || "mysql://root:password@localhost:3306/jardiniers";

// Détection d'une base hébergée sur le cloud (nécessite SSL)
const isLocal =
  databaseUrl.includes("localhost") ||
  databaseUrl.includes("127.0.0.1") ||
  databaseUrl.includes("jardinier-mysql");

// Création du pool de connexion MySQL avec support SSL automatique pour le cloud
export const poolConnection = mysql.createPool({
  uri: databaseUrl,
  ssl: !isLocal && !databaseUrl.includes("ssl=") ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

// Initialisation de Drizzle ORM
export const db = drizzle(poolConnection, { schema, mode: "default" });
