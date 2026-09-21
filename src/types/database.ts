export type AdminRole = "admin" | "editor";

export type PublishStatus = "all" | "published" | "draft";

export type AdminUser = {
  id: string;
  user_id: string;
  role: AdminRole;
  created_at: string;
};

export type EventRecord = {
  id: string;
  title: string;
  description: string;
  event_date: string;
  start_time: string | null;
  location: string;
  registration_url: string | null;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type ProgramRecord = {
  id: string;
  title: string;
  description: string;
  cover_image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type GalleryItem = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  display_order: number;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type AwardRecord = {
  id: string;
  title: string;
  description: string;
  award_year: number | null;
  image_url: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

export type PartnerRecord = {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  display_order: number;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type ContactMessageRecord = {
  id: string;
  name: string;
  email: string;
  topic: string;
  message: string;
  read: boolean;
  created_at: string;
};

export type AdminManagedTable =
  "events" | "programs" | "gallery_items" | "awards" | "partners" | "contact_messages";

export type StorageBucket =
  "event-images" | "program-images" | "gallery-images" | "award-images" | "partner-logos";
