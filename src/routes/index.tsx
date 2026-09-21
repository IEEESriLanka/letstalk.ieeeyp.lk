import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion } from "motion/react";
import { Preloader } from "@/components/site/preloader";
import { SiteNav } from "@/components/site/site-nav";
import { MouseGlow } from "@/components/site/mouse-glow";
import { Hero } from "@/components/site/hero";
import {
  Events,
  PastSessions,
  Gallery,
  Awards,
  Partners,
  StayConnected,
  Contact,
} from "@/components/site/sections";
import { SiteFooter } from "@/components/site/site-footer";
import { getSiteContent } from "@/lib/content-actions";
import { defaultSiteContent } from "@/lib/site-content";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      {
        title:
          "IEEE LETs talk — National project - IEEE Young Professionals Sri Lanka | Where Future Professionals Meet Industry Leaders",
      },
      {
        name: "description",
        content:
          "From inspiring leadership talks to hands-on workshops, IEEE LETs talk brings students and industry together to learn, collaborate, and create what's next.",
      },
      {
        property: "og:title",
        content: "IEEE LETs talk — Where Future Professionals Meet Industry Leaders",
      },
      {
        property: "og:description",
        content:
          "Empowering Careers Through Conversations, Learning, and Leadership. National project - IEEE Young Professionals Sri Lanka.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: content = defaultSiteContent } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });

  return (
    <>
      <Preloader />
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <MouseGlow />
        <SiteNav />
        <Hero content={content.hero} />
        <Events events={content.events} />
        <PastSessions events={content.events} />
        <Gallery shots={content.gallery} />
        <Awards content={content.awards} />
        <Partners partners={content.partners} />
        <StayConnected content={content.connected} />
        <Contact content={content.contact} />
        <SiteFooter email={content.contact.email} />
      </motion.main>
    </>
  );
}
