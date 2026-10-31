import { supabase } from "@/lib/supabase";
import type { StorageBucket } from "@/types/database";

const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 5 * 1024 * 1024;

export function validateImage(file: File) {
  if (!allowedTypes.includes(file.type)) {
    throw new Error("Please upload a JPG, PNG, or WEBP image.");
  }

  if (file.size > maxImageSize) {
    throw new Error("Images must be 5MB or smaller.");
  }
}

export function getStoragePathFromPublicUrl(url: string) {
  const marker = "/storage/v1/object/public/";
  const markerIndex = url.indexOf(marker);
  if (markerIndex === -1) return null;
  const path = url.slice(markerIndex + marker.length);
  const [, ...objectParts] = path.split("/");
  const objectPath = objectParts.join("/");
  try {
    return decodeURIComponent(objectPath);
  } catch {
    return objectPath;
  }
}

async function prepareImageForUpload(file: File): Promise<File> {
  if (typeof window === "undefined" || !file.type.startsWith("image/")) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const maxDimension = 1200;
    let { width, height } = bitmap;
    if (width > maxDimension || height > maxDimension) {
      if (width > height) {
        height = Math.round((height * maxDimension) / width);
        width = maxDimension;
      } else {
        width = Math.round((width * maxDimension) / height);
        height = maxDimension;
      }
    }
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(bitmap, 0, 0, width, height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob || blob.size >= file.size) return file;
    return new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), { type: "image/webp" });
  } catch {
    return file;
  }
}

export async function uploadImage(bucket: StorageBucket, file: File, folder: string) {
  validateImage(file);
  const processedFile = await prepareImageForUpload(file);
  const extension = processedFile.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, processedFile, {
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return getPublicImageUrl(bucket, path);
}

export async function listPublicImages(bucket: StorageBucket, folder: string) {
  const { data, error } = await supabase.storage.from(bucket).list(folder, {
    limit: 1000,
    sortBy: { column: "created_at", order: "asc" },
  });
  if (error) throw new Error(error.message);

  return (data ?? [])
    .filter((item) => item.name && !item.name.startsWith("."))
    .map((item) => getPublicImageUrl(bucket, `${folder}/${item.name}`));
}

export function getPublicImageUrl(bucket: StorageBucket, path: string) {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export async function deleteImage(bucket: StorageBucket, imageUrl?: string | null) {
  if (!imageUrl) return;
  const path = getStoragePathFromPublicUrl(imageUrl);
  if (!path) return;

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) throw new Error(error.message);
}
