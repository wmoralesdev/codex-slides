import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CornersIn, CornersOut } from "@phosphor-icons/react";
import { projectionRoute } from "../router";
import { findDeck, type Deck } from "../decks";
import { slideMetadata } from "../decks/metadata";
import { isLocalhost } from "../live/host";
import { useSession } from "../live/useSession";
import { ProjectedQuestion } from "../components/presenter/ProjectedQuestion";
import { ProjectedQr } from "../components/presenter/ProjectedQr";
import { stableContent } from "../components/presenter/sessionContent";
import { useAmbientMotion } from "../components/presenter/useAmbientMotion";

export function ProjectionPage() {
  const { deckSlug, sessionId } = projectionRoute.useParams();
  const deck = findDeck(deckSlug);
  return deck ? (
    <LiveProjection key={sessionId} deck={deck} sessionId={sessionId} />
  ) : (
    <main className="empty-page">
      <h1>Ese deck todavía no existe.</h1>
      <Link to="/" className="button primary">
        Ver la biblioteca
      </Link>
    </main>
  );
}

function LiveProjection({
  deck,
  sessionId,
}: {
  deck: Deck;
  sessionId: string;
}) {
  // This window never inherits the moderator's private view or joins as a voter.
  const live = useSession(sessionId, { publicOnly: true });
  const surface = useRef<HTMLDivElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState("");
  const [online, setOnline] = useState(() => navigator.onLine);
  const motion = useAmbientMotion();
  useEffect(() => {
    const update = () => setFullscreen(Boolean(document.fullscreenElement));
    const updateOnline = () => setOnline(navigator.onLine);
    document.addEventListener("fullscreenchange", update);
    window.addEventListener("online", updateOnline);
    window.addEventListener("offline", updateOnline);
    return () => {
      document.removeEventListener("fullscreenchange", update);
      window.removeEventListener("online", updateOnline);
      window.removeEventListener("offline", updateOnline);
    };
  }, []);
  async function toggleFullscreen() {
    setFullscreenError("");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (surface.current?.requestFullscreen)
        await surface.current.requestFullscreen();
      else
        setFullscreenError(
          "Usá la opción de pantalla completa de tu navegador.",
        );
    } catch {
      setFullscreenError("Usá la opción de pantalla completa de tu navegador.");
    }
  }
  if (live.isLoading)
    return (
      <main className="empty-page">
        <div className="loading-block" />
        <p>Conectando la proyección…</p>
      </main>
    );
  const session = live.session;
  if (!session)
    return (
      <main className="empty-page">
        <h1>No encontramos esta sesión.</h1>
        <p>
          {live.error || "Abrí la proyección desde la ventana del moderador."}
        </p>
        <button
          className="button secondary"
          onClick={() => window.location.reload()}
        >
          Volver a conectar
        </button>
      </main>
    );
  if (
    session.deckSlug !== deck.slug ||
    stableContent(slideMetadata(deck.slides)) !== stableContent(session.slides)
  )
    return (
      <main className="empty-page">
        <h1>La presentación cambió.</h1>
        <p>
          Iniciá una nueva sesión desde el moderador para que todas las vistas
          usen el mismo contenido.
        </p>
      </main>
    );
  const ended = session.status === "ended";
  const slide = deck.slides.find(
    (item) => item.slug === session.activeSlideSlug,
  );
  if (!slide && !ended)
    return (
      <main className="empty-page">
        <h1>No encontramos la slide activa.</h1>
        <p>Elegí una slide desde el moderador.</p>
      </main>
    );
  const Component = slide?.component;
  const hasQuestion =
    !isLocalhost &&
    !!slide?.question && (session.questionOpen || session.showResults);
  const theme = session.projectionTheme ?? "light";
  return (
    <div
      ref={surface}
      className="projection-window"
      data-testid="projection-window"
    >
      {ended ? (
        <main className="projection-ended">
          <p>GROK BOT</p>
          <h1>Gracias por participar.</h1>
          <p>La sesión terminó. La guía sigue disponible en tu teléfono.</p>
        </main>
      ) : slide && Component ? (
        <main
          className={`projection-surface ${hasQuestion && !session.qrVisible ? "has-question" : ""}`}
          data-slide-theme={theme}
        >
          {session.qrVisible ? (
            <ProjectedQr sessionId={sessionId} />
          ) : (
            <>
              <div
                className="slide-stage active-stage"
                data-slide-theme={theme}
                data-testid="projected-slide"
                data-motion-enabled={!!slide.ambientMotion}
                data-motion-state={
                  slide.ambientMotion && motion.running ? "running" : "paused"
                }
              >
                <Component key={slide.slug} />
              </div>
              {hasQuestion && slide.question && (
                <ProjectedQuestion
                  question={slide.question}
                  votes={live.votes}
                  slideSlug={slide.slug}
                  isLive
                  votingOpen={session.questionOpen}
                  showResults={session.showResults}
                />
              )}
            </>
          )}
        </main>
      ) : null}
      {(!online || live.error) && (
        <div role="status" className="projection-connection">
          Reconectando con la sesión. Mostramos la última slide recibida.
        </div>
      )}
      <div
        className={`projection-window-tools ${fullscreen ? "is-fullscreen" : ""}`}
      >
        {fullscreenError && <span role="status">{fullscreenError}</span>}
        <button
          className="button secondary"
          onClick={() => void toggleFullscreen()}
          aria-label={
            fullscreen ? "Salir de pantalla completa" : "Pantalla completa"
          }
        >
          {fullscreen ? <CornersIn size={18} /> : <CornersOut size={18} />}
          <span>
            {fullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          </span>
        </button>
      </div>
    </div>
  );
}
