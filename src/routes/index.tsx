import { createFileRoute, useLocation } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { scrollToHash } from "@/lib/scroll-utils";
import { Preloader } from "@/components/site/preloader";
import { SiteNav } from "@/components/site/site-nav";
import { MouseGlow } from "@/components/site/mouse-glow";
import { Hero } from "@/components/site/hero";
import { ImpactOverview } from "@/components/site/about-overview";
import { LatestArticles } from "@/components/site/latest-articles";
import { LatestVideos } from "@/components/site/latest-videos";
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
  const [initializing, setInitializing] = useState(true);
  const finishInitialization = useCallback(() => setInitializing(false), []);
  const routerHash = useLocation({ select: (location) => location.hash });
  const { data: content = defaultSiteContent, isPending, fetchStatus, isError, refetch } = useQuery({
    queryKey: ["site-content"],
    queryFn: () => getSiteContent(),
  });

  useEffect(() => {
    if (initializing) return;
    const targetHash = routerHash || (typeof window !== "undefined" ? window.location.hash : "");
    if (!targetHash) return;

    const timer = setTimeout(() => {
      scrollToHash(targetHash, true);
    }, 120);

    return () => clearTimeout(timer);
  }, [initializing, routerHash]);

  return (
    <>
      {initializing && (
        <Preloader
          contentReady={!isPending || fetchStatus === "paused"}
          onComplete={finishInitialization}
        />
      )}
      <motion.main
        inert={initializing}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative"
      >
        <MouseGlow />
        <SiteNav />
        {isError && (
          <div role="alert" className="relative z-10 mx-5 mt-28 rounded-2xl border border-red-200 bg-red-50 p-5 text-center text-red-700">
            <p>Unable to load website content. Please try again.</p>
            <button type="button" onClick={() => void refetch()} className="mt-2 font-semibold underline">
              Retry loading content
            </button>
          </div>
        )}
        <Hero content={content.hero} />
        <ImpactOverview content={content.about} />
        <Events events={content.events} />
        <PastSessions events={content.events} />
        <LatestArticles />
        <LatestVideos />
        <Gallery />
        <Awards content={content.awards} />
        <Partners logos={content.partnerLogos ?? []} />
        <StayConnected content={content.connected} />
        <Contact content={content.contact} />
        <SiteFooter email={content.contact.email} />
      </motion.main>
    </>
  );
}
