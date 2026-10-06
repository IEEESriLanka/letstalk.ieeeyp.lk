import { Trophy } from "lucide-react";
import { Reveal } from "./motion-primitives";
import type { SiteContent } from "@/lib/site-content";
import "./awards.css";

export function Awards({ content }: { content: SiteContent["awards"] }) {
  const highlightedEnding = content.awardName.match(/project award$/i)?.[0];
  const awardTitle = highlightedEnding
    ? content.awardName.slice(0, -highlightedEnding.length).trim()
    : content.awardName;

  return (
    <section id="awards" aria-labelledby="awards-heading" className="recognition-section">
      <div className="recognition-container">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="section-eyebrow">Awards &amp; Recognition</span>
          <h2 id="awards-heading" className="mt-5 text-3xl leading-[1.14] font-bold tracking-tight sm:text-[2.6rem]">
            Recognized for <span className="text-gradient-orange">industry impact.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-body">
            Recognition for bridging academia and industry through practical, experience-driven
            learning.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="recognition-card">
          <article className="recognition-award">
            <div aria-hidden="true" className="recognition-circle recognition-circle-top" />
            <div aria-hidden="true" className="recognition-circle recognition-circle-bottom" />
            <div aria-hidden="true" className="recognition-arc" />
            <div aria-hidden="true" className="recognition-dots" />
            <div className="recognition-award-content">
              <div className="recognition-badge-row">
                <span className="recognition-year">
                  <Trophy aria-hidden="true" />
                  {content.label}
                </span>
              </div>
              <p className="recognition-award-label">
                <span aria-hidden="true" />
                IEEE Sri Lanka Section Awards
              </p>
              <h3 className="recognition-award-title">
                {awardTitle}
                {highlightedEnding && <span>{highlightedEnding}</span>}
              </h3>
              <p className="recognition-program">{content.program}</p>
            </div>
          </article>

          <figure className="recognition-photo">
            <img
              src="/awards/ieee-sri-lanka-section-awards-2025.png"
              alt="IEEE LETs Talk representatives receiving the IEEE Sri Lanka Section Awards 2025 Best Industry Collaborative Project Award"
            />
            <figcaption>{content.description}</figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}
