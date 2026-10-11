import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Répertoire de destination : public/uploads
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    // Nom de fichier unique et sécurisé
    const extension = path.extname(file.name) || ".jpg";
    const filename = `culture-${Date.now()}-${Math.floor(Math.random() * 1000)}${extension}`;
    const filePath = path.join(uploadDir, filename);

    await writeFile(filePath, buffer);

    // URL accessible depuis le navigateur
    const publicUrl = `/uploads/${filename}`;

    return NextResponse.json({ url: publicUrl });
  } catch (err: any) {
    console.error("Erreur lors de l'upload:", err);
    return NextResponse.json({ error: "Échec de l'upload du fichier." }, { status: 500 });
  }
}
