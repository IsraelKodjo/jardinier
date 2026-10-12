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

    // Tentative d'écriture locale sur le disque public/uploads
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads");
      await mkdir(uploadDir, { recursive: true });

      const extension = path.extname(file.name) || ".jpg";
      const filename = `culture-${Date.now()}-${Math.floor(Math.random() * 1000)}${extension}`;
      const filePath = path.join(uploadDir, filename);

      await writeFile(filePath, buffer);

      const publicUrl = `/uploads/${filename}`;
      return NextResponse.json({ url: publicUrl });
    } catch (fsErr) {
      console.warn("Écriture disque impossible (ex: conteneur Docker), encodage direct en Data URL :", fsErr);
      const mime = file.type || "image/jpeg";
      const base64 = buffer.toString("base64");
      return NextResponse.json({ url: `data:${mime};base64,${base64}` });
    }
  } catch (err: any) {
    console.error("Erreur lors de l'upload:", err);
    return NextResponse.json({ error: "Échec de l'upload du fichier." }, { status: 500 });
  }
}
