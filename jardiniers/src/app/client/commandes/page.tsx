import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { commandes } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import CommandesView from "./CommandesView";

export const dynamic = "force-dynamic";

export default async function MesCommandesPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/connexion");
  }

  const userId = (session.user as any).id;

  // Récupération des vraies commandes de l'utilisateur connecté dans MySQL
  const userOrders = await db
    .select()
    .from(commandes)
    .where(eq(commandes.clientId, userId))
    .orderBy(desc(commandes.createdAt));

  return <CommandesView orders={userOrders} />;
}
