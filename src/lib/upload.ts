import type { Id } from "../../convex/_generated/dataModel";

/** Réduit une image à 1600 px max et la convertit en WebP (souvent 10× plus léger). */
export async function compressImage(file: File, maxSize = 1600, quality = 0.82): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.type === "image/gif" || file.type === "image/svg+xml") {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const w = Math.round(bitmap.width * scale);
  const h = Math.round(bitmap.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/webp", quality));
  return blob && blob.size < file.size ? blob : file;
}

/** Envoie un fichier vers le stockage Convex et renvoie son identifiant. */
export async function uploadToConvex(uploadUrl: string, blob: Blob): Promise<Id<"_storage">> {
  const res = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": blob.type || "application/octet-stream" },
    body: blob,
  });
  if (!res.ok) throw new Error("Échec de l'envoi du fichier");
  const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };
  return storageId;
}
