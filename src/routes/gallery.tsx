import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, Camera, Image, Sparkles } from "lucide-react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteNav } from "@/components/site/site-nav";
import { Reveal, RevealGroup, fadeUp } from "@/components/site/motion-primitives";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";
import galleryOne from "@/assets/gallery-1.jpg";
import galleryTwo from "@/assets/gallery-2.jpg";
import galleryThree from "@/assets/gallery-3.jpg";
import galleryFour from "@/assets/gallery-4.jpg";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Gallery | IEEE LETs Talk" },
      {
        name: "description",
        content:
          "Explore moments from IEEE LETs Talk sessions, workshops, networking events, and community experiences.",
      },
    ],
  }),
  component: GalleryPage,
});

const fallbackGalleryPhotos = [
  {
    image: galleryOne,
    title: "Leadership Conversations",
    caption: "Industry leaders sharing career stories and practical lessons.",
    category: "Talks",
    span: "lg:col-span-2 lg:row-span-2",
  },
  {
    image: galleryTwo,
    title: "Hands-on Workshops",
    caption: "Participants building skills through guided technical sessions.",
    category: "Workshops",
  },
  {
    image: galleryThree,
    title: "Community Networking",
    caption: "Students and young professionals connecting beyond the session.",
    category: "Community",
  },
  {
    image: galleryFour,
    title: "Panel Discussions",
    caption: "Cross-disciplinary ideas from speakers, mentors, and volunteers.",
    category: "Panels",
    span: "lg:col-span-2",
  },
  {
    image: galleryTwo,
    title: "Learning Circles",
    caption: "Small-group moments that turn advice into action.",
    category: "Learning",
  },
  {
    image: galleryOne,
    title: "Audience Moments",
    caption: "A growing national community of future professionals.",
    category: "Events",
  },
  {
    image: galleryThree,
    title: "Volunteer Energy",
    caption: "The organizing teams who make every experience welcoming.",
    category: "Team",
  },
  {
    image: galleryFour,
    title: "Shared Milestones",
    caption: "Celebrating the journey of IEEE LETs Talk across Sri Lanka.",
    category: "Milestones",
  },
];

function GalleryPage() {
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });
  const galleryPhotos =
    content.gallery.length > 0
      ? content.gallery.map((item, index) => ({
          image:
            item.imageUrl ||
            ({ "gallery-1": galleryOne, "gallery-2": galleryTwo, "gallery-3": galleryThree, "gallery-4": galleryFour }[
              item.image
            ] ?? galleryOne),
          title: item.caption,
          caption: item.alt,
          category: index === 0 ? "Featured" : "Gallery",
          span: index === 0 ? "lg:col-span-2 lg:row-span-2" : item.span,
        }))
      : fallbackGalleryPhotos;

  return (
    <main id="top" className="min-h-screen overflow-hidden bg-background text-body">
      <SiteNav />

      <section className="relative overflow-hidden bg-ieee-deep pt-32 pb-20 text-white lg:pt-40 lg:pb-28">
        <img src={galleryOne} alt="" className="absolute inset-0 size-full object-cover opacity-24" />
        <div
          aria-hidden
          className="absolute inset-0 bg-[linear-gradient(115deg,color-mix(in_oklab,var(--ieee-deep)_95%,transparent),color-mix(in_oklab,var(--ieee-deep)_74%,transparent)_58%,color-mix(in_oklab,var(--orange)_42%,transparent))]"
        />
        <div aria-hidden className="absolute inset-0 bg-grid opacity-20" />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr] lg:items-end">
          <Reveal>
            <span className="inline-flex items-center gap-2 rounded-full border border-orange/40 bg-orange/15 px-4 py-1.5 text-xs font-semibold text-orange">
              <Camera className="size-3.5" />
              Gallery
            </span>
            <h1 className="mt-6 max-w-3xl text-4xl leading-[1.05] font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Moments from the <span className="text-orange-soft">IEEE LETs Talk</span> community.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
              A closer look at the talks, workshops, networking moments, and volunteer-led
              experiences that shape the LETs Talk journey.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/"
                hash="gallery"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-6 py-3 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-white/20"
              >
                <ArrowLeft className="size-4" />
                Back to home
              </Link>
              <a
                href="/#contact"
                className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-orange)] px-6 py-3 text-sm font-semibold text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
              >
                Share photos
                <ArrowRight className="size-4" />
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <GalleryMetric value={String(galleryPhotos.length)} label="Featured moments" />
              <GalleryMetric value={String(content.events.length)} label="Program tracks" />
              <GalleryMetric value="1" label="National community" />
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-background py-20 lg:py-28">
        <div className="mx-auto max-w-6xl px-5">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="section-eyebrow">Photo Story</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Sessions, workshops, and shared learning in motion.
            </h2>
          </Reveal>

          <RevealGroup className="mt-14 grid auto-rows-[230px] grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {galleryPhotos.map((photo) => (
              <motion.figure
                key={`${photo.title}-${photo.category}`}
                variants={fadeUp}
                className={`group relative overflow-hidden rounded-3xl border border-border bg-ieee-deep shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${photo.span ?? ""}`}
              >
                <img
                  src={photo.image}
                  alt={photo.title}
                  loading="lazy"
                  className="size-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-108"
                />
                <div className="absolute inset-0 flex flex-col justify-between bg-[linear-gradient(to_top,color-mix(in_oklab,var(--ieee-deep)_82%,transparent),transparent_62%)] p-6">
                  <span className="w-fit rounded-full border border-white/25 bg-white/15 px-3 py-1 text-[0.7rem] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-md">
                    {photo.category}
                  </span>
                  <figcaption>
                    <h3 className="text-xl font-bold text-white">{photo.title}</h3>
                    <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80">
                      {photo.caption}
                    </p>
                  </figcaption>
                </div>
              </motion.figure>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="relative overflow-hidden bg-ieee-tint py-20 lg:py-28">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-50" />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl shadow-lift">
              <img src={galleryFour} alt="IEEE LETs Talk event highlight" className="aspect-[5/4] w-full object-cover" />
              <div className="absolute inset-0 bg-[linear-gradient(to_top,color-mix(in_oklab,var(--ieee-deep)_62%,transparent),transparent_58%)]" />
              <div className="absolute right-6 bottom-6 left-6 text-white">
                <p className="text-xs font-bold tracking-[0.16em] text-orange-soft uppercase">
                  Featured highlight
                </p>
                <h3 className="mt-2 text-2xl font-bold">Community-built experiences</h3>
              </div>
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="section-eyebrow">Beyond the Frame</span>
            <h2 className="mt-5 text-3xl leading-tight font-bold text-heading sm:text-4xl">
              Every photo carries a little part of the LETs Talk story.
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {["Speakers and mentors", "Technical learning", "Volunteer leadership", "Industry connections"].map((item) => (
                <div key={item} className="rounded-2xl border border-border bg-white p-5 shadow-soft">
                  <Sparkles className="size-5 text-orange" />
                  <p className="mt-3 text-sm font-bold text-heading">{item}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <SiteFooter email={content.contact.email} />
    </main>
  );
}

function GalleryMetric({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-2xl bg-orange text-white shadow-glow">
          <Image className="size-5" />
        </span>
        <div>
          <p className="font-display text-3xl font-bold text-white">{value}</p>
          <p className="text-xs font-semibold text-white/70">{label}</p>
        </div>
      </div>
    </div>
  );
}
