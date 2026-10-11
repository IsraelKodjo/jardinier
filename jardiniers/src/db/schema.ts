import {
  int,
  timestamp,
  mysqlTable,
  primaryKey,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core"
import type { AdapterAccount } from "next-auth/adapters"

// Table des utilisateurs
export const users = mysqlTable("user", {
  id: varchar("id", { length: 255 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date", fsp: 3 }),
  image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }), // Ajout du mot de passe haché
  // Vous pourrez ajouter ici le rôle (ex: admin, jardinier, client)
  role: varchar("role", { length: 50 }).default("client"),
})

// Tables requises par NextAuth pour l'authentification (ex: OAuth Google, Github, etc.)
export const accounts = mysqlTable(
  "account",
  {
    userId: varchar("userId", { length: 255 })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: varchar("type", { length: 255 })
      .$type<AdapterAccount["type"]>()
      .notNull(),
    provider: varchar("provider", { length: 255 }).notNull(),
    providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
    refresh_token: varchar("refresh_token", { length: 255 }),
    access_token: varchar("access_token", { length: 255 }),
    expires_at: int("expires_at"),
    token_type: varchar("token_type", { length: 255 }),
    scope: varchar("scope", { length: 255 }),
    id_token: varchar("id_token", { length: 2048 }),
    session_state: varchar("session_state", { length: 255 }),
  },
  (account) => ({
    compoundKey: primaryKey({ columns: [account.provider, account.providerAccountId] }),
  })
)

export const sessions = mysqlTable("session", {
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().primaryKey(),
  userId: varchar("userId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = mysqlTable(
  "verificationToken",
  {
    identifier: varchar("identifier", { length: 255 }).notNull(),
    token: varchar("token", { length: 255 }).notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (vt) => ({
    compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
  })
)


// ----------------------------------------------------
// TABLES MÉTIERS (Application Jardiniers)
// ----------------------------------------------------

// 1. Table des Jardins (Appartient à un utilisateur/client)
export const jardins = mysqlTable("jardin", {
  id: int("id").autoincrement().primaryKey(),
  ownerId: varchar("ownerId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  address: varchar("address", { length: 500 }),
  surface: int("surface"), // Surface en mètres carrés (m²)
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// 2. Table des Prestations (Services proposés par les jardiniers)
export const prestations = mysqlTable("prestation", {
  id: int("id").autoincrement().primaryKey(),
  jardinierId: varchar("jardinierId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(), // ex: "Tonte de pelouse"
  description: varchar("description", { length: 1000 }),
  pricePerHour: int("pricePerHour"), // Prix par heure
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// 3. Table des Rendez-vous (Réservations de prestations par un client pour son jardin)
export const rendezvous = mysqlTable("rendezvous", {
  id: int("id").autoincrement().primaryKey(),
  clientId: varchar("clientId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jardinierId: varchar("jardinierId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  jardinId: int("jardinId")
    .references(() => jardins.id, { onDelete: "set null" }), // Jardin concerné
  prestationId: int("prestationId")
    .references(() => prestations.id, { onDelete: "set null" }), // Prestation réservée
  date: timestamp("date", { mode: "date" }).notNull(), // Date et heure du RDV
  status: varchar("status", { length: 50 }).default("pending"), // pending, confirmed, cancelled, completed
  notes: varchar("notes", { length: 1000 }), // Instructions supplémentaires du client
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// 4. Table des Cultures (Catalogue agricole réel)
export const cultures = mysqlTable("culture", {
  id: varchar("id", { length: 50 }).notNull().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  price: int("price").notNull(),
  unit: varchar("unit", { length: 50 }).default("FCFA / kg"),
  maturationDays: int("maturationDays").notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  description: varchar("description", { length: 1000 }),
  image: varchar("image", { length: 500 }),
  available: boolean("available").default(true),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});

// 5. Table des Commandes de cultures (Liée au compte client connecté)
export const commandes = mysqlTable("commande", {
  id: varchar("id", { length: 100 }).notNull().primaryKey(),
  clientId: varchar("clientId", { length: 255 })
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  cultureId: varchar("cultureId", { length: 50 })
    .notNull()
    .references(() => cultures.id, { onDelete: "cascade" }),
  cultureName: varchar("cultureName", { length: 255 }).notNull(),
  quantite: int("quantite").notNull(),
  dateLivraison: varchar("dateLivraison", { length: 50 }).notNull(),
  adresseLivraison: varchar("adresseLivraison", { length: 500 }).notNull(),
  emballage: varchar("emballage", { length: 100 }).default("Carton standard"),
  status: varchar("status", { length: 50 }).default("EN_ATTENTE"), // EN_ATTENTE, EN_PRODUCTION, LIVRE
  dateLancement: varchar("dateLancement", { length: 50 }),
  quantiteComplementaire: varchar("quantiteComplementaire", { length: 255 }),
  createdAt: timestamp("createdAt", { mode: "date" }).defaultNow(),
});
