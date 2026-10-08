import { supabase, isSupabaseConfigured } from "./supabase";
import type { GalleryAlbum, GalleryItem } from "@/types/database";

export type PublicGalleryAlbum = GalleryAlbum & { images: GalleryItem[] };

export async function getPublishedGalleryAlbums(): Promise<PublicGalleryAlbum[]> {
  if (!isSupabaseConfigured) return [];

  const { data: albums, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (error) throw new Error(error.message);

  const { data: images, error: imageError } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (imageError) throw new Error(imageError.message);

  return (albums ?? []).map((album) => ({
    ...(album as GalleryAlbum),
    images: (images ?? []).filter((image) => image.album_id === album.id) as GalleryItem[],
  }));
}

export async function getPublishedGalleryAlbum(slug: string): Promise<PublicGalleryAlbum | null> {
  if (!isSupabaseConfigured) return null;

  const { data: album, error } = await supabase
    .from("gallery_albums")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!album) return null;

  const { data: images, error: imageError } = await supabase
    .from("gallery_items")
    .select("*")
    .eq("album_id", album.id)
    .eq("published", true)
    .order("display_order", { ascending: true });
  if (imageError) throw new Error(imageError.message);
  return { ...(album as GalleryAlbum), images: (images ?? []) as GalleryItem[] };
}
