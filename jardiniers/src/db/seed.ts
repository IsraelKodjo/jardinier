import "dotenv/config";
import { db } from "./index";
import { cultures } from "./schema";

const initialCultures = [
  { 
    id: "C1", 
    name: "Tomates Rondes", 
    price: 1500, 
    unit: "FCFA / kg", 
    maturationDays: 90,
    category: "Légume-fruit",
    description: "Tomates juteuses et charnues, idéales pour les sauces et salades. Cultivées sans pesticides chimiques de synthèse.",
    image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C2", 
    name: "Pommes de Terre", 
    price: 800, 
    unit: "FCFA / kg", 
    maturationDays: 120,
    category: "Tubercule",
    description: "Pommes de terre à chair ferme, parfaites pour la cuisson à la vapeur, rissolées ou en purée.",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C3", 
    name: "Carottes Bio", 
    price: 1200, 
    unit: "FCFA / kg", 
    maturationDays: 70,
    category: "Légume-racine",
    description: "Carottes croquantes riches en vitamines, cultivées dans le respect des normes biologiques.",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C4", 
    name: "Oignons Jaunes", 
    price: 900, 
    unit: "FCFA / kg", 
    maturationDays: 100,
    category: "Bulbe",
    description: "Indispensables dans toutes les cuisines, nos oignons se conservent longtemps et parfument vos plats.",
    image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?q=80&w=600&auto=format&fit=crop",
    available: true
  },
  { 
    id: "C5", 
    name: "Poivrons Verts", 
    price: 2000, 
    unit: "FCFA / kg", 
    maturationDays: 85,
    category: "Légume-fruit",
    description: "Poivrons charnus et croquants, parfaits pour les grillades ou pour apporter de la couleur à vos plats.",
    image: "https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?q=80&w=600&auto=format&fit=crop",
    available: false
  },
];

async function seed() {
  console.log("Seeding cultures into database...");
  for (const item of initialCultures) {
    try {
      await db.insert(cultures).values(item).onDuplicateKeyUpdate({ set: item });
      console.log(`Inserted / updated: ${item.name}`);
    } catch (e) {
      console.error(`Error inserting ${item.name}:`, e);
    }
  }
  console.log("Seeding complete!");
  process.exit(0);
}

seed();
