import { db } from "@/db";
import { cultures } from "@/db/schema";
import AdminCatalogueView from "./AdminCatalogueView";

export const dynamic = "force-dynamic";

export default async function GestionCataloguePage() {
  let allCultures: any[] = [];
  try {
    allCultures = await db.select().from(cultures);
  } catch (err) {
    console.error("Erreur chargement catalogue :", err);
  }

  return <AdminCatalogueView initialCultures={allCultures} />;
}
