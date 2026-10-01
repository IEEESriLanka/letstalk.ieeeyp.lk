import { Award, CheckCircle2, Trophy } from "lucide-react";
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

          <aside className="recognition-detail" aria-label="Award-winning program">
            <div aria-hidden="true" className="recognition-detail-arc" />
            <div className="recognition-detail-content">
              <div className="recognition-icon">
                <Award aria-hidden="true" />
              </div>
              <p className="recognition-program-label">Vision to Value</p>
              <h4>The Business Analysis Experience Program</h4>
              <p className="recognition-description">{content.description}</p>
              <div className="recognition-verification">
                <CheckCircle2 aria-hidden="true" />
                <span>Verified Section Recognition</span>
              </div>
            </div>
          </aside>
        </Reveal>
      </div>
    </section>
  );
}
