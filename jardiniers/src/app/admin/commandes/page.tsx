import { db } from "@/db";
import { commandes, users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import AdminCommandesView, { AdminOrder } from "./AdminCommandesView";

export default async function AdminCommandesPage() {
  // Récupération de toutes les commandes avec les informations du client depuis MySQL
  const allOrders = await db
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

  return <AdminCommandesView initialOrders={allOrders as AdminOrder[]} />;
}
