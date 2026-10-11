import { db } from "@/db";
import { commandes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminCommandesView, { AdminOrder } from "./AdminCommandesView";

export const dynamic = "force-dynamic";

export default async function AdminCommandesPage() {
  let allOrders: any[] = [];
  try {
    allOrders = await db
      .select({
        id: commandes.id,
        clientId: commandes.clientId,
        clientName: users.name,
        clientEmail: users.email,
        cultureId: commandes.cultureId,
        cultureName: commandes.cultureName,
        quantite: commandes.quantite,
        dateLivraison: commandes.dateLivraison,
        adresseLivraison: commandes.adresseLivraison,
        emballage: commandes.emballage,
        status: commandes.status,
        dateLancement: commandes.dateLancement,
        quantiteComplementaire: commandes.quantiteComplementaire,
        createdAt: commandes.createdAt,
      })
      .from(commandes)
      .leftJoin(users, eq(commandes.clientId, users.id))
      .orderBy(desc(commandes.createdAt));
  } catch (err) {
    console.error("Erreur chargement commandes :", err);
  }

  return <AdminCommandesView initialOrders={allOrders as AdminOrder[]} />;
}
