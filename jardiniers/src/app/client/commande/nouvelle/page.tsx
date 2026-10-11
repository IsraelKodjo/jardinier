import { db } from "@/db";
import { cultures } from "@/db/schema";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import NouvelleCommandeForm from "./NouvelleCommandeForm";

interface PageProps {
  searchParams: Promise<{ culture?: string }>;
}

export const dynamic = "force-dynamic";

export default async function NouvelleCommandePage(props: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/connexion");
  }

  // Récupération des cultures disponibles dans MySQL
  const availableCultures = await db.select().from(cultures);
  const searchParams = await props.searchParams;

  return (
    <NouvelleCommandeForm
      cultures={availableCultures}
      defaultCultureName={searchParams.culture}
    />
  );
}
