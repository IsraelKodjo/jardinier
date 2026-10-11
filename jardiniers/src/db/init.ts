import { db, poolConnection } from "./index";
import { cultures } from "./schema";

export async function ensureDatabaseInitialized() {
  try {
    // 1. Tables Utilisateurs & Auth (Exécutées via poolConnection brut sans formatage Drizzle)
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS \`user\` (
        \`id\` varchar(255) NOT NULL PRIMARY KEY,
        \`name\` varchar(255),
        \`email\` varchar(255) NOT NULL UNIQUE,
        \`password\` varchar(255),
        \`role\` varchar(50) DEFAULT 'client',
        \`emailVerified\` timestamp NULL,
        \`image\` varchar(255),
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS \`account\` (
        \`userId\` varchar(255) NOT NULL,
        \`type\` varchar(255) NOT NULL,
        \`provider\` varchar(255) NOT NULL,
        \`providerAccountId\` varchar(255) NOT NULL,
        \`refresh_token\` varchar(255),
        \`access_token\` varchar(255),
        \`expires_at\` int,
        \`token_type\` varchar(255),
        \`scope\` varchar(255),
        \`id_token\` varchar(255),
        \`session_state\` varchar(255),
        PRIMARY KEY (\`provider\`, \`providerAccountId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS \`session\` (
        \`sessionToken\` varchar(255) NOT NULL PRIMARY KEY,
        \`userId\` varchar(255) NOT NULL,
        \`expires\` timestamp NOT NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 2. Table Cultures
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS \`culture\` (
        \`id\` varchar(50) NOT NULL PRIMARY KEY,
        \`name\` varchar(255) NOT NULL,
        \`price\` int NOT NULL,
        \`unit\` varchar(50) DEFAULT 'FCFA / kg',
        \`maturationDays\` int NOT NULL,
        \`category\` varchar(100) NOT NULL,
        \`description\` varchar(1000),
        \`image\` varchar(500),
        \`available\` boolean DEFAULT true,
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 3. Table Commandes
    await poolConnection.query(`
      CREATE TABLE IF NOT EXISTS \`commande\` (
        \`id\` varchar(100) NOT NULL PRIMARY KEY,
        \`clientId\` varchar(255) NOT NULL,
        \`cultureId\` varchar(50) NOT NULL,
        \`cultureName\` varchar(255) NOT NULL,
        \`quantite\` int NOT NULL,
        \`dateLivraison\` varchar(50) NOT NULL,
        \`adresseLivraison\` varchar(500) NOT NULL,
        \`emballage\` varchar(100) DEFAULT 'Carton standard',
        \`status\` varchar(50) DEFAULT 'EN_ATTENTE',
        \`dateLancement\` varchar(50),
        \`quantiteComplementaire\` varchar(255),
        \`createdAt\` timestamp DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    // 4. Insertion initiale des cultures si la table est vide
    const existingCultures = await db.select().from(cultures);
    if (existingCultures.length === 0) {
      await db.insert(cultures).values([
        {
          id: "C1",
          name: "Tomates Rondes",
          price: 1500,
          unit: "FCFA / kg",
          maturationDays: 90,
          category: "Légume-fruit",
          description: "Tomates charnues et savoureuses.",
          image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
          available: true,
        },
        {
          id: "C2",
          name: "Pommes de Terre",
          price: 800,
          unit: "FCFA / kg",
          maturationDays: 120,
          category: "Tubercule",
          description: "Pommes de terre fraîches à chair ferme.",
          image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop",
          available: true,
        },
        {
          id: "C3",
          name: "Carottes Bio",
          price: 1200,
          unit: "FCFA / kg",
          maturationDays: 70,
          category: "Légume-racine",
          description: "Carottes croquantes et sucrées.",
          image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop",
          available: true,
        },
        {
          id: "C4",
          name: "Oignons Jaunes",
          price: 900,
          unit: "FCFA / kg",
          maturationDays: 100,
          category: "Bulbe",
          description: "Oignons savoureux et longue conservation.",
          image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop",
          available: true,
        },
        {
          id: "C5",
          name: "Poivrons Verts",
          price: 2000,
          unit: "FCFA / kg",
          maturationDays: 85,
          category: "Légume-fruit",
          description: "Poivrons charnus et croquants.",
          image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=600&auto=format&fit=crop",
          available: true,
        },
      ]);
    }
    return { success: true };
  } catch (err: any) {
    console.error("Erreur lors de ensureDatabaseInitialized :", err);
    return { success: false, error: err?.message };
  }
}
