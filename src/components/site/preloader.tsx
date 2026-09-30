import { useEffect, useId, useState } from "react";
import { UsersRound } from "lucide-react";
import letsTalkLogo from "@/assets/lets-talk-logo.png";
import "./preloader.css";

type PreloaderProps = {
  contentReady: boolean;
  onComplete: () => void;
};

/** Progress counts resolved startup tasks, not elapsed time or downloaded bytes. */
export function Preloader({ contentReady, onComplete }: PreloaderProps) {
  const [assets, setAssets] = useState({ logo: false, fonts: false });
  const [dismissed, setDismissed] = useState(false);
  const id = useId();
  const completed = Number(contentReady) + Number(assets.logo) + Number(assets.fonts);
  const progress = Math.round((completed / 3) * 100);

  useEffect(() => {
    let active = true;
    const logo = new Image();
    const settleLogo = () => {
      if (active) setAssets((previous) => ({ ...previous, logo: true }));
    };
    logo.onload = settleLogo;
    logo.onerror = settleLogo;
    logo.src = letsTalkLogo;
    if (logo.complete) settleLogo();
    const settleFonts = () => {
      if (active) setAssets((previous) => ({ ...previous, fonts: true }));
    };
    // Failed resources settle too: the page can use its existing fallbacks.
    if (document.fonts) void document.fonts.ready.then(settleFonts, settleFonts);
    else settleFonts();
    return () => {
      active = false;
      logo.onload = null;
      logo.onerror = null;
    };
  }, []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // A safety deadline, never a minimum display duration or simulated progress.
    const deadline = window.setTimeout(() => setDismissed(true), 12000);
    return () => {
      window.clearTimeout(deadline);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    if (completed === 3 || dismissed) onComplete();
  }, [completed, dismissed, onComplete]);

  return (
    <section className="site-preloader" aria-labelledby={`${id}-title`} aria-busy="true">
      <div className="preloader-orbit preloader-orbit-blue" aria-hidden="true" />
      <div className="preloader-orbit preloader-orbit-orange" aria-hidden="true" />
      <div className="preloader-dots preloader-dots-top" aria-hidden="true" />
      <div className="preloader-dots preloader-dots-bottom" aria-hidden="true" />
      <div className="preloader-content">
        <div className="preloader-emblem">
          <div className="preloader-ring" aria-hidden="true" />
          <div className="preloader-logo">
            <img src={letsTalkLogo} alt="LETs Talk logo" width="112" height="112" />
          </div>
        </div>
        <p className="preloader-badge">
          <UsersRound size={19} aria-hidden="true" />
          IEEE Young Professionals Sri Lanka
        </p>
        <h1 id={`${id}-title`} className="preloader-title">
          <span>IEEE</span> <span>LETs</span> <span>talk</span>
        </h1>
        <p className="preloader-message" role="status">
          Loading leadership talks &amp; speaker sessions...
        </p>
        <div className="preloader-progress-row">
          <div
            className="preloader-track"
            role="progressbar"
            aria-label="Website initialization"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${completed} of 3 startup tasks resolved`}
          >
            <div className="preloader-fill" style={{ width: `${progress}%` }} />
          </div>
          <span className="preloader-percentage" aria-hidden="true">
            {progress}%
          </span>
        </div>
        <div className="preloader-segments" aria-hidden="true">
          {[0, 1, 2].map((segment) => (
            <span key={segment} data-active={segment === Math.min(completed, 2)} />
          ))}
        </div>
      </div>
    </section>
  );
}
