import { NextResponse } from "next/server";
import { ensureDatabaseInitialized } from "@/db/init";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await ensureDatabaseInitialized();
  if (result.success) {
    return NextResponse.json({
      success: true,
      message: "Base de données initialisée avec succès ! Tables créées et catalogue inséré.",
    });
  } else {
    return NextResponse.json(
      {
        success: false,
        error: result.error,
        hint: "Vérifiez que la variable DATABASE_URL est bien configurée dans Render.",
      },
      { status: 500 }
    );
  }
}
