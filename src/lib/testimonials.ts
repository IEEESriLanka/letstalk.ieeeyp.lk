import { z } from "zod";

export const speakerCommentSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Enter the speaker's name.").max(120),
  designation: z.string().trim().min(1, "Enter the speaker's designation.").max(180),
  comment: z.string().trim().min(1, "Enter a comment.").max(1200),
  imageUrl: z.union([
    z.literal(""),
    z
      .string()
      .url()
      .refine((url) => new URL(url).protocol === "https:", "Use an HTTPS photo URL."),
  ]),
  published: z.boolean(),
});

export const speakerCommentsSchema = z
  .array(speakerCommentSchema)
  .max(30)
  .refine(
    (comments) => new Set(comments.map((comment) => comment.id)).size === comments.length,
    "Each comment must have a unique ID.",
  );

export type SpeakerComment = z.infer<typeof speakerCommentSchema>;

// Old content has no comments. Ignore malformed entries instead of allowing an
// optional section to crash the homepage (or fabricating speaker endorsements).
export function getPublishedComments(value: unknown): SpeakerComment[] {
  if (!Array.isArray(value)) return [];
  const seen = new Set<string>();
  return value.slice(0, 30).flatMap((entry) => {
    const parsed = speakerCommentSchema.safeParse(entry);
    if (!parsed.success || !parsed.data.published || seen.has(parsed.data.id)) return [];
    seen.add(parsed.data.id);
    return [parsed.data];
  });
}
