import { db } from "@/db";
import { cultures } from "@/db/schema";
import { ensureDatabaseInitialized } from "@/db/init";
import AdminCatalogueView from "./AdminCatalogueView";

export const dynamic = "force-dynamic";

export default async function GestionCataloguePage() {
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

  return <AdminCatalogueView initialCultures={allCultures} />;
}
