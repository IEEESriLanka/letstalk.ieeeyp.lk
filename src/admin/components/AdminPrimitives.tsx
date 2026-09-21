import { ImagePlus, Search, UploadCloud } from "lucide-react";
import { useEffect, useState, type InputHTMLAttributes, type ReactNode } from "react";
import type { PublishStatus } from "@/types/database";

export function StatCard({
  label,
  value,
  icon,
  tone = "blue",
}: {
  label: string;
  value: number | string;
  icon: ReactNode;
  tone?: "blue" | "orange" | "green" | "violet" | "slate";
}) {
  const tones = {
    blue: "bg-[#00629b]/10 text-[#00629b]",
    orange: "bg-orange/10 text-orange",
    green: "bg-emerald-50 text-emerald-700",
    violet: "bg-violet-50 text-violet-700",
    slate: "bg-slate-100 text-slate-700",
  };
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex size-11 items-center justify-center rounded-md ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function StatusBadge({
  active,
  activeText = "Published",
  inactiveText = "Draft",
}: {
  active: boolean;
  activeText?: string;
  inactiveText?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
        active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
      }`}
    >
      {active ? activeText : inactiveText}
    </span>
  );
}

export function SearchInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="relative block w-full sm:max-w-xs">
      <span className="sr-only">Search</span>
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
      <input
        {...props}
        className="h-10 w-full rounded-md border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none transition focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15"
      />
    </label>
  );
}

export function FilterSelect({
  value,
  onChange,
}: {
  value: PublishStatus;
  onChange: (value: PublishStatus) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as PublishStatus)}
      className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15"
      aria-label="Filter by publication status"
    >
      <option value="all">All status</option>
      <option value="published">Published</option>
      <option value="draft">Draft</option>
    </select>
  );
}

export function EmptyState({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
      <div className="mx-auto flex size-12 items-center justify-center rounded-md bg-slate-100 text-slate-500">
        <ImagePlus className="size-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-800">{title}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="h-16 animate-pulse rounded-lg bg-slate-200/70" />
      ))}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-5">
      <p className="text-sm font-semibold text-red-800">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md bg-red-700 px-3 py-2 text-sm font-semibold text-white"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}

export function ConfirmDialog({
  open,
  title,
  description,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/55 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-slate-950">{title}</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">{description}</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-md bg-red-700 px-4 py-2 text-sm font-semibold text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

export function FormField({
  label,
  children,
  required,
}: {
  label: string;
  children: ReactNode;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-slate-700">
        {label} {required ? <span className="text-red-600">*</span> : null}
      </span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

export function AdminModal({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 px-4 py-8">
      <div className="max-h-full w-full max-w-3xl overflow-y-auto rounded-lg bg-white shadow-xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
          <h2 className="text-lg font-bold text-slate-950">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm font-semibold text-slate-700"
          >
            Close
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

export function ImageUploader({
  value,
  onFile,
  disabled,
}: {
  value?: string | null;
  onFile: (file: File) => void;
  disabled?: boolean;
}) {
  const [preview, setPreview] = useState<string | null>(value ?? null);

  useEffect(() => {
    setPreview(value ?? null);
  }, [value]);

  return (
    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4">
      {preview ? (
        <img
          src={preview}
          alt="Selected preview"
          className="mb-3 h-40 w-full rounded-md object-cover"
        />
      ) : (
        <div className="mb-3 flex h-40 items-center justify-center rounded-md bg-white text-slate-400">
          <UploadCloud className="size-8" />
        </div>
      )}
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={disabled}
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          setPreview(URL.createObjectURL(file));
          onFile(file);
        }}
        className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-[#00629b] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
      />
      <p className="mt-2 text-xs text-slate-500">JPG, PNG, or WEBP. Maximum 5MB.</p>
    </div>
  );
}

export const fieldClass =
  "h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15";

export const textAreaClass =
  "min-h-28 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-[#00629b] focus:ring-2 focus:ring-[#00629b]/15";

export const primaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md bg-[#00629b] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#005080] disabled:cursor-not-allowed disabled:opacity-60";

export const secondaryButtonClass =
  "inline-flex items-center justify-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50";
