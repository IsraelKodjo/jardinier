import { redirect } from "next/navigation";

export default function ValidationComptesPage() {
  // La validation manuelle des comptes a été désactivée : tous les comptes sont actifs immédiatement
  redirect("/admin");
}
