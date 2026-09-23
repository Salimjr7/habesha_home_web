import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];
    
    // Also check single file fallback
    if (files.length === 0) {
      const singleFile = formData.get("file") as File | null;
      if (singleFile) {
        files.push(singleFile);
      }
    }

    if (files.length === 0) {
      return NextResponse.json({ success: false, error: "No files uploaded" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "properties");
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true });
    }

    const uploadedUrls: string[] = [];

    for (const file of files) {
      if (!file || typeof file === "string" || !file.name) continue;

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Determine extension safely
      let ext = path.extname(file.name).toLowerCase();
      if (!ext || ext === ".") {
        if (file.type === "image/png") ext = ".png";
        else if (file.type === "image/webp") ext = ".webp";
        else if (file.type === "image/gif") ext = ".gif";
        else ext = ".jpg";
      }

      // Sanitize extension
      if (![".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"].includes(ext)) {
        ext = ".jpg";
      }

      const uniqueName = `prop-${Date.now()}-${Math.random().toString(36).substring(2, 9)}${ext}`;
      const filePath = path.join(uploadDir, uniqueName);

      await writeFile(filePath, buffer);
      uploadedUrls.push(`/uploads/properties/${uniqueName}`);
    }

    if (uploadedUrls.length === 0) {
      return NextResponse.json({ success: false, error: "No valid image files processed" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      urls: uploadedUrls,
      url: uploadedUrls[0],
    });
  } catch (err: unknown) {
    console.error("Upload error:", err);
    const message = err instanceof Error ? err.message : "Failed to upload file";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
