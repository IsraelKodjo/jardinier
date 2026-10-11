import { db } from "@/db";
import { cultures } from "@/db/schema";
import CatalogueView from "./CatalogueView";

// Server Component : Récupère les cultures réelles depuis MySQL
export default async function CataloguePage() {
  const allCultures = await db.select().from(cultures);

  return <CatalogueView cultures={allCultures} />;
}
