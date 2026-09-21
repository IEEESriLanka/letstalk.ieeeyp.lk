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
  return objectParts.join("/");
}

export async function uploadImage(bucket: StorageBucket, file: File, folder: string) {
  validateImage(file);
  const extension = file.name.split(".").pop()?.toLowerCase() || "webp";
  const path = `${folder}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) throw new Error(error.message);
  return getPublicImageUrl(bucket, path);
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
