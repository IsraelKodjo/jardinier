import { db } from "@/db";
import { cultures } from "@/db/schema";
import { ensureDatabaseInitialized } from "@/db/init";
import CatalogueView from "./CatalogueView";

export const dynamic = "force-dynamic";

// Server Component : Récupère les cultures réelles depuis MySQL
export default async function CataloguePage() {
  let allCultures: any[] = [];
  try {
    allCultures = await db.select().from(cultures);
  } catch (err: any) {
    if (
      err?.message?.includes("doesn't exist") ||
      err?.message?.includes("Failed query") ||
      err?.message?.includes("1146")
    ) {
      await ensureDatabaseInitialized();
      try {
        allCultures = await db.select().from(cultures);
      } catch (e) {}
    }
  }

  return <CatalogueView cultures={allCultures} />;
}
