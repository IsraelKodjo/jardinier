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

// Déterminer le nom de la base de données (si non spécifié ou si 'mysql', on bascule sur 'test' pour TiDB Cloud)
export let targetDatabase = "jardiniers";
try {
  const urlObj = new URL(databaseUrl.replace("mysql://", "http://"));
  const pathPart = urlObj.pathname.replace(/^\//, "").split("?")[0].trim();
  if (pathPart && pathPart !== "mysql") {
    targetDatabase = pathPart;
  } else if (!isLocal) {
    targetDatabase = "test"; // Base par défaut de TiDB Cloud
  }
} catch {
  if (!isLocal) targetDatabase = "test";
}

// Création du pool de connexion MySQL avec support SSL automatique pour le cloud
export const poolConnection = mysql.createPool({
  uri: databaseUrl,
  database: targetDatabase,
  ssl: !isLocal && !databaseUrl.includes("ssl=") ? { rejectUnauthorized: false } : undefined,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

// Initialisation de Drizzle ORM
export const db = drizzle(poolConnection, { schema, mode: "default" });
