import "./brand.css";

/**
 * Event logos. Each one renders both ink versions and CSS picks the one that
 * matches `data-slide-theme` (slides) or the light app chrome (default).
 */
export function OpenAIWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`dd-logo dd-logo--openai ${className}`}>
      <img className="dd-logo-ink" src="/brand/openai-wordmark.png" alt="OpenAI" width={324} height={88} draggable={false} />
      <img className="dd-logo-paper" src="/brand/openai-wordmark-light.png" alt="OpenAI" width={324} height={88} draggable={false} />
    </span>
  );
}

/** Symbol + wordmark lockup, copied from ailabs-web's public/brand. */
export function OpenAILogo({ className = "" }: { className?: string }) {
  return (
    <span className={`dd-logo dd-logo--openai ${className}`}>
      <img className="dd-logo-ink" src="/brand/openai-lockup.svg" alt="OpenAI" width={1957} height={480} draggable={false} />
      <img className="dd-logo-paper" src="/brand/openai-lockup-light.svg" alt="OpenAI" width={1957} height={480} draggable={false} />
    </span>
  );
}

export function AiLabsLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`dd-logo dd-logo--ailabs ${className}`}>
      <img className="dd-logo-ink" src="/brand/ailabs-dark.svg" alt="Ai Labs" width={1295} height={324} draggable={false} />
      <img className="dd-logo-paper" src="/brand/ailabs-light.svg" alt="Ai Labs" width={1295} height={324} draggable={false} />
    </span>
  );
}

export function PortalXLogo({ className = "" }: { className?: string }) {
  return (
    <span className={`dd-logo dd-logo--portalx ${className}`}>
      <img className="dd-logo-ink" src="/brand/portal-x-negro.png" alt="Portal-X" width={1600} height={229} draggable={false} />
      <img className="dd-logo-paper" src="/brand/portal-x-blanco.png" alt="Portal-X" width={1600} height={229} draggable={false} />
    </span>
  );
}

/** Monochrome wordmark; see public/brand/codex-assets-source.md for its provenance. */
export function CodexWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`dd-logo dd-logo--codex ${className}`}>
      <img src="/brand/codex-wordmark.svg" alt="Codex" width={91} height={24} draggable={false} />
    </span>
  );
}
