import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Edit, Eye, EyeOff, Plus, Trash2, UploadCloud } from "lucide-react";
import { FormEvent, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { AdminLayout } from "@/admin/components/AdminLayout";
import {
  AdminModal,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  FilterSelect,
  FormField,
  ImageUploader,
  LoadingSkeleton,
  SearchInput,
  StatusBadge,
  fieldClass,
  primaryButtonClass,
  secondaryButtonClass,
  textAreaClass,
} from "@/admin/components/AdminPrimitives";
import {
  deleteAward,
  deleteEvent,
  deleteGalleryItem,
  deleteGalleryAlbum,
  deleteMessage,
  deletePartner,
  deleteProgram,
  getSiteSettings,
  listAwards,
  listEvents,
  listGallery,
  listGalleryAlbums,
  listMessages,
  listPartners,
  listPrograms,
  saveAward,
  saveEvent,
  saveGalleryItem,
  saveGalleryAlbum,
  savePartner,
  saveProgram,
  saveSiteSettings,
  updateMessageStatus,
} from "@/admin/services/admin-data";
import { deleteImage, listPublicImages, uploadImage } from "@/lib/storage";
import type {
  AwardRecord,
  ContactMessageRecord,
  EventRecord,
  GalleryItem,
  GalleryAlbum,
  PartnerRecord,
  ProgramRecord,
  PublishStatus,
} from "@/types/database";

type ModalMode<T> = { open: true; record: Partial<T> | null } | { open: false; record: null };

function Toolbar({
  search,
  onSearch,
  status,
  onStatus,
  onAdd,
  addLabel,
  extra,
}: {
  search: string;
  onSearch: (value: string) => void;
  status: PublishStatus;
  onStatus: (value: PublishStatus) => void;
  onAdd: () => void;
  addLabel: string;
  extra?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Search"
        />
        <FilterSelect value={status} onChange={onStatus} />
        {extra}
      </div>
      <button type="button" onClick={onAdd} className={primaryButtonClass}>
        <Plus className="size-4" />
        {addLabel}
      </button>
    </div>
  );
}

function PageShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        {children}
      </section>
    </AdminLayout>
  );
}

export function EventsPage({ pastOnly = false }: { pastOnly?: boolean }) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PublishStatus>("all");
  const [modal, setModal] = useState<ModalMode<EventRecord>>({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState<EventRecord | null>(null);
  const query = useQuery({
    queryKey: ["events", search, status],
    queryFn: () => listEvents(search, status),
  });
  const today = new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" });
  const events = query.data?.filter((event) => !pastOnly || event.event_date < today);

  const remove = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("Event deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell
      title={pastOnly ? "Past Events" : "Events"}
      subtitle={pastOnly ? "Add past events and publish them in Our journey so far." : "Create, publish, and maintain event listings."}
    >
      <Toolbar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        addLabel={pastOnly ? "Add Past Event" : "Add Event"}
        onAdd={() => setModal({ open: true, record: null })}
      />
      {query.isLoading ? <LoadingSkeleton /> : null}
      {query.isError ? (
        <ErrorState message="Unable to load events." onRetry={() => query.refetch()} />
      ) : null}
      {events?.length === 0 ? <EmptyState title={pastOnly ? "No past events match your filters." : "No events yet."} /> : null}
      {events && events.length > 0 ? (
        <div className="overflow-hidden rounded-lg border border-slate-200">
          <div className="hidden grid-cols-[80px_1.4fr_.8fr_.8fr_.7fr_.7fr] bg-slate-50 px-4 py-3 text-xs font-bold tracking-wide text-slate-500 uppercase md:grid">
            <span>Image</span>
            <span>Title</span>
            <span>Date</span>
            <span>Location</span>
            <span>Status</span>
            <span>Actions</span>
          </div>
          <div className="divide-y divide-slate-100">
            {events.map((event) => (
              <div
                key={event.id}
                className="grid gap-3 px-4 py-4 md:grid-cols-[80px_1.4fr_.8fr_.8fr_.7fr_.7fr] md:items-center"
              >
                <Thumb src={event.cover_image_url} />
                <div>
                  <p className="font-semibold text-slate-900">{event.title}</p>
                  <p className="line-clamp-1 text-sm text-slate-500">{event.description}</p>
                </div>
                <p className="text-sm text-slate-600">{event.event_date}</p>
                <p className="text-sm text-slate-600">{event.location}</p>
                <StatusBadge active={event.published} />
                <RowActions
                  onEdit={() => setModal({ open: true, record: event })}
                  onDelete={() => setDeleteTarget(event)}
                />
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <EventFormModal
        pastOnly={pastOnly}
        key={modal.open ? (modal.record?.id ?? "new") : "closed"}
        open={modal.open}
        record={modal.record}
        onClose={() => setModal({ open: false, record: null })}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete event?"
        description="This removes the event and attempts to delete its cover image from storage."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
      />
    </PageShell>
  );
}

function EventFormModal({
  open,
  record,
  onClose,
  pastOnly = false,
}: {
  open: boolean;
  record: Partial<EventRecord> | null;
  onClose: () => void;
  pastOnly?: boolean;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<EventRecord>>(record ?? { published: false });
  const [file, setFile] = useState<File | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      validateRequired(form.title, "Title");
      validateRequired(form.description, "Description");
      validateRequired(form.event_date, "Event date");
      if (pastOnly && form.event_date! >= new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Colombo" })) {
        throw new Error("Choose a date before today for a past event.");
      }
      validateRequired(form.location, "Location");
      validateUrl(form.registration_url);
      const cover = file ? await uploadImage("event-images", file, "events") : form.cover_image_url;
      return saveEvent({ ...form, cover_image_url: cover ?? null });
    },
    onSuccess: () => {
      toast.success("Event saved.");
      void queryClient.invalidateQueries({ queryKey: ["events"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AdminModal open={open} title={record?.id ? "Edit Event" : pastOnly ? "Add Past Event" : "Add Event"} onClose={onClose}>
      {pastOnly ? <p className="px-6 pt-4 text-sm text-slate-600">Choose the original event date and upload its poster. Enable Published to show it under the matching year in Our journey so far.</p> : null}
      <ManagedForm onSubmit={() => mutation.mutate()} submitting={mutation.isPending}>
        <FormField label="Title" required>
          <input
            className={fieldClass}
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>
        <FormField label="Event Date" required>
          <input
            type="date"
            className={fieldClass}
            value={form.event_date ?? ""}
            onChange={(e) => setForm({ ...form, event_date: e.target.value })}
          />
        </FormField>
        <FormField label="Start Time">
          <input
            type="time"
            className={fieldClass}
            value={form.start_time ?? ""}
            onChange={(e) => setForm({ ...form, start_time: e.target.value })}
          />
        </FormField>
        <FormField label="Location" required>
          <input
            className={fieldClass}
            value={form.location ?? ""}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </FormField>
        <FormField label="Registration URL">
          <input
            className={fieldClass}
            value={form.registration_url ?? ""}
            onChange={(e) => setForm({ ...form, registration_url: e.target.value })}
          />
        </FormField>
        <FormField label="Description" required>
          <textarea
            className={textAreaClass}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </FormField>
        <FormField label="Cover Image">
          <ImageUploader
            value={form.cover_image_url ?? null}
            onFile={setFile}
            disabled={mutation.isPending}
          />
        </FormField>
        <BooleanField
          label="Published"
          checked={Boolean(form.published)}
          onChange={(published) => setForm({ ...form, published })}
        />
      </ManagedForm>
    </AdminModal>
  );
}

export function ProgramsPage() {
  return (
    <SimplePublishPage<ProgramRecord>
      title="Programs"
      subtitle="Manage published program tracks and initiatives."
      queryKey="programs"
      list={listPrograms}
      save={saveProgram}
      remove={deleteProgram}
      bucket="program-images"
      folder="programs"
      empty="No programs yet."
      addLabel="Add Program"
      imageField="cover_image_url"
    />
  );
}

export function AwardsPage() {
  return (
    <SimplePublishPage<AwardRecord>
      title="Awards"
      subtitle="Manage awards and recognition."
      queryKey="awards"
      list={listAwards}
      save={saveAward}
      remove={deleteAward}
      bucket="award-images"
      folder="awards"
      empty="No awards yet."
      addLabel="Add Award"
      imageField="image_url"
      award
    />
  );
}

type SimpleRecord = ProgramRecord | AwardRecord;

function SimplePublishPage<T extends SimpleRecord>({
  title,
  subtitle,
  queryKey,
  list,
  save,
  remove,
  bucket,
  folder,
  empty,
  addLabel,
  imageField,
  award,
}: {
  title: string;
  subtitle: string;
  queryKey: string;
  list: (search: string, status: PublishStatus) => Promise<T[]>;
  save: (input: Partial<T>) => Promise<T>;
  remove: (record: T) => Promise<void>;
  bucket: "program-images" | "award-images";
  folder: string;
  empty: string;
  addLabel: string;
  imageField: "cover_image_url" | "image_url";
  award?: boolean;
}) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PublishStatus>("all");
  const [modal, setModal] = useState<ModalMode<T>>({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState<T | null>(null);
  const query = useQuery({
    queryKey: [queryKey, search, status],
    queryFn: () => list(search, status),
  });
  const removeMutation = useMutation({
    mutationFn: remove,
    onSuccess: () => {
      toast.success(`${title.slice(0, -1)} deleted.`);
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell title={title} subtitle={subtitle}>
      <Toolbar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        addLabel={addLabel}
        onAdd={() => setModal({ open: true, record: null })}
      />
      {query.isLoading ? <LoadingSkeleton /> : null}
      {query.isError ? (
        <ErrorState
          message={`Unable to load ${title.toLowerCase()}.`}
          onRetry={() => query.refetch()}
        />
      ) : null}
      {query.data?.length === 0 ? <EmptyState title={empty} /> : null}
      {query.data && query.data.length > 0 ? (
        <ResponsiveList
          items={query.data.map((item) => ({
            id: item.id,
            image: String(item[imageField] ?? ""),
            title: item.title,
            description: item.description,
            meta:
              award && "award_year" in item
                ? String(item.award_year ?? "No year")
                : new Date(item.created_at).toLocaleDateString(),
            status: <StatusBadge active={item.published} />,
            actions: (
              <RowActions
                onEdit={() => setModal({ open: true, record: item })}
                onDelete={() => setDeleteTarget(item)}
              />
            ),
          }))}
        />
      ) : null}
      <SimpleFormModal<T>
        open={modal.open}
        record={modal.record}
        onClose={() => setModal({ open: false, record: null })}
        save={save}
        queryKey={queryKey}
        bucket={bucket}
        folder={folder}
        imageField={imageField}
        award={award}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title={`Delete ${title.slice(0, -1).toLowerCase()}?`}
        description="This deletes the database record and associated storage image when possible."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && removeMutation.mutate(deleteTarget)}
      />
    </PageShell>
  );
}

function SimpleFormModal<T extends SimpleRecord>({
  open,
  record,
  onClose,
  save,
  queryKey,
  bucket,
  folder,
  imageField,
  award,
}: {
  open: boolean;
  record: Partial<T> | null;
  onClose: () => void;
  save: (input: Partial<T>) => Promise<T>;
  queryKey: string;
  bucket: "program-images" | "award-images";
  folder: string;
  imageField: "cover_image_url" | "image_url";
  award?: boolean;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<T>>(record ?? ({ published: false } as Partial<T>));
  const [file, setFile] = useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      validateRequired(form.title, "Title");
      validateRequired(form.description, "Description");
      const imageUrl = file ? await uploadImage(bucket, file, folder) : form[imageField];
      return save({ ...form, [imageField]: imageUrl } as Partial<T>);
    },
    onSuccess: () => {
      toast.success("Content saved.");
      void queryClient.invalidateQueries({ queryKey: [queryKey] });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <AdminModal open={open} title={record?.id ? "Edit Content" : "Add Content"} onClose={onClose}>
      <ManagedForm onSubmit={() => mutation.mutate()} submitting={mutation.isPending}>
        <FormField label="Title" required>
          <input
            className={fieldClass}
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>
        {award ? (
          <FormField label="Award Year">
            <input
              type="number"
              className={fieldClass}
              value={"award_year" in form ? (form.award_year ?? "") : ""}
              onChange={(e) =>
                setForm({ ...form, award_year: Number(e.target.value) } as Partial<T>)
              }
            />
          </FormField>
        ) : null}
        <FormField label="Description" required>
          <textarea
            className={textAreaClass}
            value={form.description ?? ""}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </FormField>
        <FormField label="Image">
          <ImageUploader
            value={String(form[imageField] ?? "")}
            onFile={setFile}
            disabled={mutation.isPending}
          />
        </FormField>
        <BooleanField
          label="Published"
          checked={Boolean(form.published)}
          onChange={(published) => setForm({ ...form, published })}
        />
      </ManagedForm>
    </AdminModal>
  );
}

export function GalleryPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PublishStatus>("all");
  const [modal, setModal] = useState<ModalMode<GalleryItem>>({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState<GalleryItem | null>(null);
  const [albumDraft, setAlbumDraft] = useState("");
  const [albumFilter, setAlbumFilter] = useState("");
  const [editingAlbum, setEditingAlbum] = useState<GalleryAlbum | null>(null);
  const [deletingAlbum, setDeletingAlbum] = useState<GalleryAlbum | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const query = useQuery({
    queryKey: ["gallery", search, status],
    queryFn: () => listGallery(search, status),
  });
  const albums = useQuery({ queryKey: ["gallery-albums-admin"], queryFn: listGalleryAlbums });
  const visiblePhotos = query.data?.filter((item) => !albumFilter || (albumFilter === "unassigned" ? !item.album_id : item.album_id === albumFilter));
  function refreshAlbums() {
    for (const key of ["gallery", "gallery-albums-admin", "gallery-albums", "gallery-album"]) {
      void queryClient.invalidateQueries({ queryKey: [key] });
    }
  }
  const updateAlbum = useMutation({
    mutationFn: saveGalleryAlbum,
    onSuccess: () => { setEditingAlbum(null); refreshAlbums(); toast.success("Album saved."); },
    onError: (error) => toast.error(error.message),
  });
  const createAlbum = useMutation({
    mutationFn: () =>
      saveGalleryAlbum({
        title: albumDraft,
        published: true,
        display_order: albums.data?.length ?? 0,
      }),
    onSuccess: (album) => {
      setAlbumDraft("");
      setUploadAlbumId(album.id);
      setAlbumFilter(album.id);
      refreshAlbums();
      toast.success("Album created.");
      void queryClient.invalidateQueries({ queryKey: ["gallery-albums-admin"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const removeAlbum = useMutation({
    mutationFn: deleteGalleryAlbum,
    onSuccess: () => {
      toast.success("Album deleted. Its images are now unassigned.");
      setDeletingAlbum(null);
      setAlbumFilter("");
      setUploadAlbumId("");
      refreshAlbums();
      void queryClient.invalidateQueries({ queryKey: ["gallery-albums-admin"] });
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: deleteGalleryItem,
    onSuccess: () => {
      toast.success("Gallery item deleted.");
      refreshAlbums();
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
    onError: (error) => toast.error(error.message),
  });

  async function uploadMany(files: FileList | null) {
    if (!files?.length) return;
    if (!uploadAlbumId) { toast.error("Select an album first."); return; }
    setUploading(true);
    try {
      await Promise.all(
        Array.from(files).map(async (file, index) => {
          const image_url = await uploadImage("gallery-images", file, "gallery");
          return saveGalleryItem({
            title: file.name.replace(/\.[^.]+$/, ""),
            caption: "",
            image_url,
            album_id: uploadAlbumId,
            display_order: (query.data?.length ?? 0) + index + 1,
            published: true,
          });
        }),
      );
      toast.success("Gallery images uploaded.");
      refreshAlbums();
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload images.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <PageShell
      title="Gallery"
      subtitle="Create albums, upload images, and publish separate collections."
    >
      <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <FormField label="Create album">
            <input
              className={fieldClass}
              placeholder="e.g. LETs Talk 2026"
              value={albumDraft}
              onChange={(event) => setAlbumDraft(event.target.value)}
            />
          </FormField>
          <button
            type="button"
            className={primaryButtonClass}
            disabled={!albumDraft.trim() || createAlbum.isPending}
            onClick={() => createAlbum.mutate()}
          >
            <Plus className="size-4" /> Create Album
          </button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {albums.data?.map((album) => (
            <div
              key={album.id}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 py-1 pr-1 pl-3 text-sm font-semibold text-slate-700"
            >
              <button type="button" className={albumFilter === album.id ? "text-blue-700 underline" : "hover:text-blue-700"} onClick={() => { setAlbumFilter(album.id); setUploadAlbumId(album.id); }}>{album.title}</button>
              <button type="button" aria-label={`Edit ${album.title}`} className="rounded-full p-1 hover:bg-blue-100" onClick={() => setEditingAlbum(album)}><Edit className="size-3.5" /></button>
              <button
                type="button"
                aria-label={`Delete ${album.title}`}
                className="rounded-full p-1 hover:bg-red-100 hover:text-red-700"
                onClick={() => setDeletingAlbum(album)}
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>
      {albums.isError ? <ErrorState message="Unable to load albums." onRetry={() => albums.refetch()} /> : null}
      <div className="mb-4">
        <FormField label="Filter photos by album">
          <select className={fieldClass} value={albumFilter} onChange={(e) => { setAlbumFilter(e.target.value); if (e.target.value !== "unassigned") setUploadAlbumId(e.target.value); }}>
            <option value="">All albums</option><option value="unassigned">Unassigned photos</option>
            {albums.data?.map((album) => <option key={album.id} value={album.id}>{album.title}</option>)}
          </select>
        </FormField>
      </div>
      <Toolbar
        search={search}
        onSearch={setSearch}
        status={status}
        onStatus={setStatus}
        addLabel="Add Image"
        onAdd={() => setModal({ open: true, record: null })}
        extra={
          <div className="flex flex-wrap gap-2">
            <select
              aria-label="Bulk upload album"
              className={fieldClass}
              value={uploadAlbumId}
              onChange={(e) => setUploadAlbumId(e.target.value)}
            >
              <option value="">Select album</option>
              {albums.data?.map((album) => (
                <option key={album.id} value={album.id}>
                  {album.title}
                </option>
              ))}
            </select>
            <label
              className={`${secondaryButtonClass} ${!uploadAlbumId && albums.data?.length ? "opacity-60" : ""}`}
            >
              <UploadCloud className="size-4" />
              {uploading ? "Uploading…" : "Bulk Upload"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={!uploadAlbumId || uploading}
                onChange={(e) => { void uploadMany(e.target.files); e.target.value = ""; }}
              />
            </label>
          </div>
        }
      />
      {query.isLoading ? <LoadingSkeleton /> : null}
      {query.isError ? (
        <ErrorState message="Unable to load gallery." onRetry={() => query.refetch()} />
      ) : null}
      {visiblePhotos?.length === 0 ? <EmptyState title="No photos in this selection." /> : null}
      {visiblePhotos && visiblePhotos.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visiblePhotos.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <img
                src={item.image_url}
                alt={item.title}
                className="aspect-[4/3] w-full object-cover"
              />
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm text-slate-500">{item.caption || "No caption"}</p>
                  </div>
                  <StatusBadge active={item.published} />
                </div>
                <div className="mt-4">
                  <RowActions
                    onEdit={() => setModal({ open: true, record: item })}
                    onDelete={() => setDeleteTarget(item)}
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : null}
      {modal.open ? <GalleryFormModal
        key={modal.record?.id ?? `new-${uploadAlbumId}`}
        open={modal.open}
        record={modal.record ?? { album_id: uploadAlbumId || null, published: true, display_order: 0 }}
        onClose={() => setModal({ open: false, record: null })}
        albums={albums.data ?? []}
      /> : null}
      <AdminModal open={Boolean(editingAlbum)} title="Edit album" onClose={() => setEditingAlbum(null)}>
        {editingAlbum ? <ManagedForm onSubmit={() => { if (!editingAlbum.title.trim()) { toast.error("Album title is required."); return; } updateAlbum.mutate(editingAlbum); }} submitting={updateAlbum.isPending}>
          <FormField label="Album title" required><input className={fieldClass} value={editingAlbum.title} onChange={(e) => setEditingAlbum({ ...editingAlbum, title: e.target.value })} /></FormField>
          <FormField label="Description"><textarea className={textAreaClass} value={editingAlbum.description ?? ""} onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })} /></FormField>
          <FormField label="Display order (lowest first)"><input type="number" className={fieldClass} value={editingAlbum.display_order} onChange={(e) => setEditingAlbum({ ...editingAlbum, display_order: Number(e.target.value) })} /></FormField>
          <label className="flex items-center gap-2"><input type="checkbox" checked={editingAlbum.published} onChange={(e) => setEditingAlbum({ ...editingAlbum, published: e.target.checked })} /> Published</label>
        </ManagedForm> : null}
      </AdminModal>
      <ConfirmDialog open={Boolean(deletingAlbum)} title="Delete album?" description="Photos will be kept as unassigned photos." onCancel={() => setDeletingAlbum(null)} onConfirm={() => deletingAlbum && removeAlbum.mutate(deletingAlbum)} />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete gallery image?"
        description="This deletes the database record and attempts to delete the image from storage."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
      />
    </PageShell>
  );
}

function GalleryFormModal({
  open,
  record,
  onClose,
  albums,
}: {
  open: boolean;
  record: Partial<GalleryItem> | null;
  onClose: () => void;
  albums: GalleryAlbum[];
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<GalleryItem>>(
    record ?? { published: true, display_order: 0 },
  );
  const [file, setFile] = useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      validateRequired(form.title, "Title");
      const image_url = file
        ? await uploadImage("gallery-images", file, "gallery")
        : form.image_url;
      validateRequired(image_url, "Image");
      return saveGalleryItem({ ...form, image_url: image_url! });
    },
    onSuccess: () => {
      toast.success("Gallery item saved.");
      void queryClient.invalidateQueries({ queryKey: ["gallery-albums"] });
      void queryClient.invalidateQueries({ queryKey: ["gallery-album"] });
      void queryClient.invalidateQueries({ queryKey: ["gallery"] });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <AdminModal
      open={open}
      title={record?.id ? "Edit Gallery Image" : "Add Gallery Image"}
      onClose={onClose}
    >
      <ManagedForm onSubmit={() => mutation.mutate()} submitting={mutation.isPending}>
        <FormField label="Title" required>
          <input
            className={fieldClass}
            value={form.title ?? ""}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </FormField>
        <FormField label="Caption">
          <textarea
            className={textAreaClass}
            value={form.caption ?? ""}
            onChange={(e) => setForm({ ...form, caption: e.target.value })}
          />
        </FormField>
        <FormField label="Display Order">
          <input
            type="number"
            className={fieldClass}
            value={form.display_order ?? 0}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
          />
        </FormField>
        <FormField label="Album">
          <select
            className={fieldClass}
            value={form.album_id ?? ""}
            onChange={(e) => setForm({ ...form, album_id: e.target.value || null })}
          >
            <option value="">Unassigned</option>
            {albums.map((album) => (
              <option key={album.id} value={album.id}>
                {album.title}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Image" required>
          <ImageUploader
            value={form.image_url ?? null}
            onFile={setFile}
            disabled={mutation.isPending}
          />
        </FormField>
        <BooleanField
          label="Published"
          checked={Boolean(form.published)}
          onChange={(published) => setForm({ ...form, published })}
        />
      </ManagedForm>
    </AdminModal>
  );
}

export function PartnersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [modal, setModal] = useState<ModalMode<PartnerRecord>>({ open: false, record: null });
  const [deleteTarget, setDeleteTarget] = useState<PartnerRecord | null>(null);
  const query = useQuery({
    queryKey: ["partners", search, status],
    queryFn: () => listPartners(search, status),
  });
  const remove = useMutation({
    mutationFn: deletePartner,
    onSuccess: () => {
      toast.success("Partner deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell title="Partners" subtitle="Manage partner logos, links, ordering, and visibility.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search partners"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "all" | "active" | "inactive")}
            className={fieldClass}
          >
            <option value="all">All status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => setModal({ open: true, record: null })}
          className={primaryButtonClass}
        >
          <Plus className="size-4" />
          Add Partner
        </button>
      </div>
      {query.isLoading ? <LoadingSkeleton /> : null}
      {query.isError ? (
        <ErrorState message="Unable to load partners." onRetry={() => query.refetch()} />
      ) : null}
      {query.data?.length === 0 ? <EmptyState title="No partners yet." /> : null}
      {query.data && query.data.length > 0 ? (
        <ResponsiveList
          items={query.data.map((item) => ({
            id: item.id,
            image: item.logo_url ?? "",
            title: item.name,
            description: item.website_url ?? "No website",
            meta: `Order ${item.display_order}`,
            status: (
              <StatusBadge active={item.active} activeText="Active" inactiveText="Inactive" />
            ),
            actions: (
              <RowActions
                onEdit={() => setModal({ open: true, record: item })}
                onDelete={() => setDeleteTarget(item)}
              />
            ),
          }))}
        />
      ) : null}
      {modal.open ? <PartnerFormModal
        key={modal.record?.id ?? "new-partner"}
        open={modal.open}
        record={modal.record}
        onClose={() => setModal({ open: false, record: null })}
      /> : null}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete partner?"
        description="This deletes the database record and attempts to delete the logo from storage."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget)}
      />
    </PageShell>
  );
}

function PartnerFormModal({
  open,
  record,
  onClose,
}: {
  open: boolean;
  record: Partial<PartnerRecord> | null;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<Partial<PartnerRecord>>(
    record ?? { active: true, display_order: 0 },
  );
  const [file, setFile] = useState<File | null>(null);
  const mutation = useMutation({
    mutationFn: async () => {
      const name = form.name?.trim() || file?.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ") || "Partner";
      validateUrl(form.website_url);
      const logo_url = file ? await uploadImage("partner-logos", file, "partners") : form.logo_url;
      validateRequired(logo_url, "Logo");
      return savePartner({ ...form, name, logo_url });
    },
    onSuccess: () => {
      toast.success("Partner saved.");
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
      void queryClient.invalidateQueries({ queryKey: ["partners"] });
      onClose();
    },
    onError: (error) => toast.error(error.message),
  });
  return (
    <AdminModal open={open} title={record?.id ? "Edit Partner" : "Add Partner"} onClose={onClose}>
      <ManagedForm onSubmit={() => mutation.mutate()} submitting={mutation.isPending}>
        <FormField label="Partner Name (optional, defaults to filename)">
          <input
            className={fieldClass}
            value={form.name ?? ""}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </FormField>
        <FormField label="Website URL">
          <input
            className={fieldClass}
            value={form.website_url ?? ""}
            onChange={(e) => setForm({ ...form, website_url: e.target.value })}
          />
        </FormField>
        <FormField label="Display Order">
          <input
            type="number"
            className={fieldClass}
            value={form.display_order ?? 0}
            onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })}
          />
        </FormField>
        <FormField label="Logo" required>
          <ImageUploader value={form.logo_url} onFile={setFile} disabled={mutation.isPending} />
        </FormField>
        <BooleanField
          label="Active"
          checked={Boolean(form.active)}
          onChange={(active) => setForm({ ...form, active })}
        />
      </ManagedForm>
    </AdminModal>
  );
}

export function MessagesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "read" | "unread">("all");
  const [selected, setSelected] = useState<ContactMessageRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactMessageRecord | null>(null);
  const query = useQuery({
    queryKey: ["messages", search, status],
    queryFn: () => listMessages(search, status),
  });
  const statusMutation = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => updateMessageStatus(id, read),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["messages"] }),
    onError: (error) => toast.error(error.message),
  });
  const remove = useMutation({
    mutationFn: (id: string) => deleteMessage(id),
    onSuccess: () => {
      toast.success("Message deleted.");
      setDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <PageShell title="Messages" subtitle="Review and manage contact form submissions.">
      <div className="mb-5 flex flex-col gap-3 sm:flex-row">
        <SearchInput
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search messages"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "all" | "read" | "unread")}
          className={fieldClass}
        >
          <option value="all">All messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
        </select>
      </div>
      {query.isLoading ? <LoadingSkeleton /> : null}
      {query.isError ? (
        <ErrorState message="Unable to load messages." onRetry={() => query.refetch()} />
      ) : null}
      {query.data?.length === 0 ? <EmptyState title="No messages found." /> : null}
      <div className="divide-y divide-slate-100 rounded-lg border border-slate-200">
        {query.data?.map((message) => (
          <article
            key={message.id}
            className="grid gap-3 p-4 lg:grid-cols-[1fr_.9fr_.7fr_.8fr] lg:items-center"
          >
            <div>
              <p className="font-semibold text-slate-900">{message.name}</p>
              <a className="text-sm font-medium text-[#00629b]" href={`mailto:${message.email}`}>
                {message.email}
              </a>
            </div>
            <p className="text-sm text-slate-600">{message.topic}</p>
            <StatusBadge active={!message.read} activeText="Unread" inactiveText="Read" />
            <div className="flex flex-wrap gap-2">
              <button className={secondaryButtonClass} onClick={() => setSelected(message)}>
                <Eye className="size-4" />
                Open
              </button>
              <button
                className={secondaryButtonClass}
                onClick={() => statusMutation.mutate({ id: message.id, read: !message.read })}
              >
                {message.read ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                {message.read ? "Mark unread" : "Mark read"}
              </button>
              <button className={secondaryButtonClass} onClick={() => setDeleteTarget(message)}>
                <Trash2 className="size-4" />
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
      <AdminModal
        open={Boolean(selected)}
        title={selected?.topic ?? "Message"}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <div>
            <p className="font-semibold text-slate-900">{selected.name}</p>
            <a href={`mailto:${selected.email}`} className="text-sm font-semibold text-[#00629b]">
              {selected.email}
            </a>
            <p className="mt-4 whitespace-pre-wrap rounded-lg bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
              {selected.message}
            </p>
          </div>
        ) : null}
      </AdminModal>
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete message?"
        description="This permanently removes this contact message."
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && remove.mutate(deleteTarget.id)}
      />
    </PageShell>
  );
}

export function SettingsPage() {
  const queryClient = useQueryClient();
  const settings = useQuery({ queryKey: ["site-settings"], queryFn: getSiteSettings });
  const uploadedBackgrounds = useQuery({
    queryKey: ["hero-background-uploads"],
    queryFn: () => listPublicImages("gallery-images", "hero-backgrounds"),
  });
  const [draft, setDraft] = useState("");
  const [backgroundSaving, setBackgroundSaving] = useState(false);
  const [backgroundToRemove, setBackgroundToRemove] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: () => saveSiteSettings(JSON.parse(draft)),
    onSuccess: () => {
      toast.success("Website settings saved.");
      void queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      void queryClient.invalidateQueries({ queryKey: ["site-content"] });
    },
    onError: (error) => toast.error(error.message),
  });

  useEffect(() => {
    if (settings.data) setDraft(JSON.stringify(settings.data, null, 2));
  }, [settings.data]);

  async function uploadBackgroundImage(file: File) {
    setBackgroundSaving(true);
    try {
      await uploadImage("gallery-images", file, "hero-backgrounds");
      await queryClient.invalidateQueries({ queryKey: ["hero-background-uploads"] });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Hero image uploaded and published.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to upload background image.");
    } finally {
      setBackgroundSaving(false);
    }
  }

  async function removeBackgroundImage(url: string) {
    setBackgroundToRemove(null);
    if (!uploadedBackgrounds.data?.includes(url)) {
      toast.error("This image is not in the hero uploads folder.");
      return;
    }

    setBackgroundSaving(true);
    try {
      await deleteImage("gallery-images", url);
      await queryClient.invalidateQueries({ queryKey: ["hero-background-uploads"] });
      await queryClient.invalidateQueries({ queryKey: ["site-content"] });
      toast.success("Uploaded hero image removed.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to remove hero image.");
    } finally {
      setBackgroundSaving(false);
    }
  }

  return (
    <AdminLayout title="Settings" subtitle="Admin profile and website settings.">
      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Admin Profile</h2>
          <p className="mt-2 text-sm text-slate-500">
            Admin accounts and sessions are stored in the local CMS database.
          </p>
          <a href="/admin/login" className={`${primaryButtonClass} mt-5`}>
            Return to login
          </a>
        </section>
        <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">Website Settings</h2>
          {settings.isLoading ? <LoadingSkeleton /> : null}
          {settings.isError ? (
            <ErrorState
              message="Unable to load website settings."
              onRetry={() => settings.refetch()}
            />
          ) : null}
          {settings.data ? (
            <form
              className="mt-4"
              onSubmit={(event) => {
                event.preventDefault();
                mutation.mutate();
              }}
            >
              <div className="mb-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-bold text-slate-900">Hero background images</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Uploaded images appear behind the homepage heading automatically.
                    </p>
                  </div>
                  <label
                    className={`${secondaryButtonClass} cursor-pointer ${backgroundSaving ? "pointer-events-none opacity-60" : ""}`}
                  >
                    <UploadCloud className="size-4" />
                    Upload image
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      disabled={backgroundSaving}
                      className="sr-only"
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        if (file) void uploadBackgroundImage(file);
                        event.currentTarget.value = "";
                      }}
                    />
                  </label>
                </div>
                <div className="mt-4">
                  <h4 className="text-sm font-bold text-slate-900">Uploaded images</h4>
                  {uploadedBackgrounds.isLoading ? (
                    <p className="mt-3 text-xs text-slate-500">Loading uploaded images…</p>
                  ) : null}
                  {uploadedBackgrounds.isError ? (
                    <p className="mt-3 text-xs font-semibold text-red-600">
                      Unable to load uploaded images.
                    </p>
                  ) : null}
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    {uploadedBackgrounds.data?.map((url) => (
                      <div
                        key={url}
                        className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                      >
                        <img
                          src={url}
                          alt="Uploaded hero background"
                          className="h-28 w-full object-cover"
                        />
                        <div className="flex flex-wrap items-center justify-between gap-2 p-2">
                          <span className="text-xs font-bold text-emerald-700">On homepage</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className={secondaryButtonClass}
                              disabled={backgroundSaving || mutation.isPending}
                              onClick={() => setBackgroundToRemove(url)}
                            >
                              <Trash2 className="size-4" /> Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {!uploadedBackgrounds.isLoading && uploadedBackgrounds.data?.length === 0 ? (
                    <p className="mt-3 text-xs text-slate-500">
                      No hero images have been uploaded yet.
                    </p>
                  ) : null}
                </div>
              </div>
              <textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                className={`${textAreaClass} min-h-96 font-mono text-xs`}
                spellCheck={false}
              />
              <button
                type="submit"
                disabled={mutation.isPending}
                className={`${primaryButtonClass} mt-4`}
              >
                {mutation.isPending ? "Saving..." : "Save Settings"}
              </button>
            </form>
          ) : null}
        </section>
      </div>
      <ConfirmDialog
        open={Boolean(backgroundToRemove)}
        title="Remove uploaded hero image?"
        description="This removes the image from the homepage and deletes its uploaded file. This cannot be undone."
        onCancel={() => setBackgroundToRemove(null)}
        onConfirm={() => {
          if (backgroundToRemove) void removeBackgroundImage(backgroundToRemove);
        }}
      />
    </AdminLayout>
  );
}

function ManagedForm({
  children,
  onSubmit,
  submitting,
}: {
  children: ReactNode;
  onSubmit: () => void;
  submitting: boolean;
}) {
  function submit(event: FormEvent) {
    event.preventDefault();
    onSubmit();
  }
  return (
    <form onSubmit={submit} className="grid gap-5 md:grid-cols-2">
      {children}
      <div className="md:col-span-2">
        <button type="submit" disabled={submitting} className={primaryButtonClass}>
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}

function BooleanField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 accent-[#00629b]"
      />
      <span className="text-sm font-semibold text-slate-700">{label}</span>
    </label>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" onClick={onEdit} className={secondaryButtonClass}>
        <Edit className="size-4" />
        Edit
      </button>
      <button type="button" onClick={onDelete} className={secondaryButtonClass}>
        <Trash2 className="size-4" />
        Delete
      </button>
    </div>
  );
}

function ResponsiveList({
  items,
}: {
  items: Array<{
    id: string;
    image: string;
    title: string;
    description: string;
    meta: string;
    status: ReactNode;
    actions: ReactNode;
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200">
      <div className="hidden grid-cols-[80px_1.4fr_1fr_.7fr_.8fr] bg-slate-50 px-4 py-3 text-xs font-bold tracking-wide text-slate-500 uppercase md:grid">
        <span>Image</span>
        <span>Title</span>
        <span>Meta</span>
        <span>Status</span>
        <span>Actions</span>
      </div>
      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item.id}
            className="grid gap-3 px-4 py-4 md:grid-cols-[80px_1.4fr_1fr_.7fr_.8fr] md:items-center"
          >
            <Thumb src={item.image} />
            <div>
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="line-clamp-1 text-sm text-slate-500">{item.description}</p>
            </div>
            <p className="text-sm text-slate-600">{item.meta}</p>
            {item.status}
            {item.actions}
          </div>
        ))}
      </div>
    </div>
  );
}

function Thumb({ src }: { src?: string | null }) {
  return src ? (
    <img src={src} alt="" className="size-14 rounded-md object-cover" />
  ) : (
    <div className="flex size-14 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-400">
      No img
    </div>
  );
}

function validateRequired(value: unknown, label: string) {
  if (typeof value !== "string" || !value.trim()) throw new Error(`${label} is required.`);
}

function validateUrl(value?: string | null) {
  if (!value) return;
  try {
    const parsed = new URL(value);
    if (!["http:", "https:"].includes(parsed.protocol)) throw new Error("Invalid protocol");
  } catch {
    throw new Error("Enter a valid URL starting with http:// or https://.");
  }
}
