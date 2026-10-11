import { db } from "@/db";
import { cultures } from "@/db/schema";
import AdminCatalogueView from "./AdminCatalogueView";

export const dynamic = "force-dynamic";

export default async function GestionCataloguePage() {
  // Récupération de toutes les cultures en base de données MySQL
  const allCultures = await db.select().from(cultures);

  return <AdminCatalogueView initialCultures={allCultures} />;
}
