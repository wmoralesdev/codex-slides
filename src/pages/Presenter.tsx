import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { QrCode, ShareNetwork, Users } from "@phosphor-icons/react";
import { deckRoute, presenterRoute } from "../router";
import { findDeck, type Deck } from "../decks";
import { slideMetadata } from "../decks/metadata";
import { formatSlideNumber, getFirstSlideNumber } from "../decks/slideNumbers";
import { ConnectionNotice } from "../components/Shell";
import { ShareModal } from "../components/ShareModal";
import { PresenterHeader } from "../components/presenter/PresenterHeader";
import { SlideRail } from "../components/presenter/SlideRail";
import { SlideControls } from "../components/presenter/SlideControls";
import { PresenterDetails } from "../components/presenter/PresenterDetails";
import { EndSessionModal } from "../components/presenter/EndSessionModal";
import { PresenterAccessModal } from "../components/presenter/PresenterAccessModal";
import { ProjectedQuestion } from "../components/presenter/ProjectedQuestion";
import { useSlideTheme } from "../components/presenter/useSlideTheme";
import { useAmbientMotion } from "../components/presenter/useAmbientMotion";
import { useLive, useLiveTransport } from "../live/LiveProvider";
import { isLocalhost } from "../live/host";
import { useSession } from "../live/useSession";
import { ProjectedQr } from "../components/presenter/ProjectedQr";
import { stableContent } from "../components/presenter/sessionContent";

type LiveSession = ReturnType<typeof useSession>;

export function DeckPage() {
  const { deckSlug } = deckRoute.useParams();
  const { slide } = deckRoute.useSearch();
  const deck = findDeck(deckSlug);
  return deck ? (
    <Workbench key={deck.slug} deck={deck} initialSlide={slide} />
  ) : (
    <MissingDeck />
  );
}

export function PresenterPage() {
  const { deckSlug, sessionId } = presenterRoute.useParams();
  const deck = findDeck(deckSlug);
  if (!deck) return <MissingDeck />;
  if (deck.presentationMode === "standalone") return <Workbench deck={deck} />;
  return <LivePresenterPage deck={deck} sessionId={sessionId} />;
}

function LivePresenterPage({
  deck,
  sessionId,
}: {
  deck: Deck;
  sessionId: string;
}) {
  const deckSlug = deck.slug;
  const live = useSession(sessionId);
  if (live.isLoading)
    return (
      <main className="empty-page">
        <div className="loading-block" />
        <p>Abriendo tu sesión…</p>
      </main>
    );
  if (!live.session)
    return (
      <main className="empty-page">
        <h1>No encontramos esta sesión.</h1>
        <p>
          {live.error ||
            "Puede pertenecer a otro navegador o a otra variante del proyecto."}
        </p>
        <Link
          to="/deck/$deckSlug"
          params={{ deckSlug }}
          search={{ slide: undefined }}
          className="button primary"
        >
          Abrir el deck
        </Link>
      </main>
    );
  if (!live.isPresenter || live.session.deckSlug !== deckSlug)
    return (
      <main className="empty-page">
        <h1>Esta es la vista del presentador.</h1>
        <p>
          Los controles están disponibles en el navegador que inició la sesión.
        </p>
        <Link
          to="/join/$sessionId"
          params={{ sessionId }}
          className="button primary"
        >
          Ir a la vista del público
        </Link>
      </main>
    );
  const metadata = slideMetadata(deck.slides);
  if (stableContent(metadata) !== stableContent(live.session.slides))
    return (
      <main className="empty-page">
        <h1>Este deck cambió desde que inició la sesión.</h1>
        <p>
          Abre una nueva sesión para que las slides, las preguntas y la guía del
          público usen el mismo contenido.
        </p>
        <Link
          to="/deck/$deckSlug"
          params={{ deckSlug }}
          search={{ slide: undefined }}
          className="button primary"
        >
          Abrir la versión actual
        </Link>
      </main>
    );
  return <Workbench deck={deck} live={live} sessionId={sessionId} />;
}

function MissingDeck() {
  return (
    <main className="empty-page">
      <h1>Ese deck todavía no existe.</h1>
      <Link to="/" className="button primary">
        Ver la biblioteca
      </Link>
    </main>
  );
}

function Workbench({
  deck,
  initialSlide,
  live,
  sessionId,
}: {
  deck: Deck;
  initialSlide?: string;
  live?: LiveSession;
  sessionId?: string;
}) {
  const [previewIndex, setPreviewIndex] = useState(() =>
    Math.max(
      0,
      deck.slides.findIndex((s) => s.slug === initialSlide),
    ),
  );
  const [share, setShare] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState("");
  const [accessOpen, setAccessOpen] = useState(false);
  const pendingAction = useRef<{
    action: () => Promise<void>;
    resolve: (completed: boolean) => void;
  } | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const { theme: previewTheme, toggleTheme } = useSlideTheme(deck.slug);
  const theme = live?.session?.projectionTheme ?? previewTheme;
  const motion = useAmbientMotion();
  const standalone = deck.presentationMode === "standalone";
  const firstSlideNumber = getFirstSlideNumber(deck.slides);
  const navigate = useNavigate();
  const { mode, createSession, authorizePresenter, hasPresenterAccess } =
    useLive();
  const transport = useLiveTransport();
  const activeIndex = live?.session
    ? Math.max(
        0,
        deck.slides.findIndex((s) => s.slug === live.session!.activeSlideSlug),
      )
    : previewIndex;
  const slide = deck.slides[activeIndex];
  const Component = slide.component;
  const nextSlide = deck.slides[activeIndex + 1];
  const NextComponent = nextSlide?.component;
  const ended = live?.session?.status === "ended";
  const votingOpen = live?.session?.questionOpen ?? false;
  const showResults = live?.session?.showResults ?? false;
  const qrVisible = live?.session?.qrVisible ?? false;
  const hasQuestion =
    !isLocalhost && !!slide.question && (!live || votingOpen || showResults);
  const projectionUrl = sessionId
    ? `/screen/${encodeURIComponent(deck.slug)}/${encodeURIComponent(sessionId)}`
    : undefined;
  async function executeAction(action: () => Promise<void>): Promise<boolean> {
    setActionError("");
    setBusy(true);
    try {
      await action();
      return true;
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "No pudimos guardar el cambio. Intenta de nuevo.",
      );
      return false;
    } finally {
      setBusy(false);
    }
  }
  function performAction(action: () => Promise<void>): Promise<boolean> {
    if (mode === "convex" && !hasPresenterAccess()) {
      if (pendingAction.current) return Promise.resolve(false);
      setActionError("");
      setAccessOpen(true);
      return new Promise((resolve) => {
        pendingAction.current = { action, resolve };
      });
    }
    return executeAction(action);
  }
  function closeAccess() {
    const pending = pendingAction.current;
    pendingAction.current = null;
    setAccessOpen(false);
    pending?.resolve(false);
  }
  async function authorizeAction(password: string, signal: AbortSignal) {
    const pending = pendingAction.current;
    await authorizePresenter(password, signal);
    if (signal.aborted || !pending || pendingAction.current !== pending) return;
    pendingAction.current = null;
    setAccessOpen(false);
    void executeAction(pending.action).then(pending.resolve);
  }
  useEffect(
    () => () => {
      pendingAction.current?.resolve(false);
      pendingAction.current = null;
    },
    [],
  );
  function move(index: number) {
    if (
      index === activeIndex ||
      index < 0 ||
      index >= deck.slides.length ||
      busy ||
      ended
    )
      return;
    if (live) void performAction(() => live.navigate(deck.slides[index].slug));
    else {
      setPreviewIndex(index);
      void navigate({
        to: "/deck/$deckSlug",
        params: { deckSlug: deck.slug },
        search: { slide: deck.slides[index].slug },
        replace: true,
      });
    }
  }
  useEffect(() => {
    function keydown(e: KeyboardEvent) {
      if (
        document.querySelector("dialog[open]") ||
        e.altKey ||
        e.ctrlKey ||
        e.metaKey ||
        (e.target instanceof HTMLElement &&
          (e.target.closest("input,textarea,select") ||
            (e.key === " " && e.target.closest("button,a")) ||
            e.target.isContentEditable))
      )
        return;
      if (["ArrowRight", "ArrowDown", " "].includes(e.key)) {
        e.preventDefault();
        move(activeIndex + 1);
      }
      if (["ArrowLeft", "ArrowUp"].includes(e.key)) {
        e.preventDefault();
        move(activeIndex - 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        move(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        move(deck.slides.length - 1);
      }
      if (e.key === "Escape") setFocusMode(false);
    }
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  });
  useEffect(() => {
    const update = () => {
      if (!document.fullscreenElement) setFocusMode(false);
    };
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);
  async function finishSession() {
    const completed = await performAction(() => live!.endSession());
    if (completed) setConfirmEnd(false);
  }
  async function start() {
    if (standalone) {
      await fullscreen();
      return;
    }
    await performAction(async () => {
      const id = await createSession({
        deckSlug: deck.slug,
        deckTitle: deck.title,
        slides: slideMetadata(deck.slides),
      });
      // Sessions start dark on the backend; DevDay projects light unless the presenter chose dark.
      if (previewTheme !== "dark")
        await transport.update(id, { type: "theme", theme: previewTheme });
      await navigate({
        to: "/present/$deckSlug/$sessionId",
        params: { deckSlug: deck.slug, sessionId: id },
      });
    });
  }
  async function fullscreen() {
    if (focusMode) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setFocusMode(false);
    } else {
      setFocusMode(true);
      try {
        await stage.current?.requestFullscreen?.();
      } catch {
        /* The distraction-free layout still works when fullscreen is unavailable. */
      }
    }
  }
  return (
    <div className="presenter-shell">
      <PresenterHeader
        isLive={!!live}
        standalone={standalone}
        ended={ended}
        busy={busy}
        onStart={() => void start()}
        onEnd={() => setConfirmEnd(true)}
        projectionUrl={projectionUrl}
      />
      <div className="presenter-body">
        <SlideRail
          slides={deck.slides}
          firstSlideNumber={firstSlideNumber}
          activeIndex={activeIndex}
          ended={ended}
          theme={theme}
          onMove={move}
        />
        <main className="presenter-main">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">
                {deck.category} <span>/</span> {deck.duration}
              </p>
              <h1>{deck.title}</h1>
            </div>
            {live && (
              <span className="participant-count">
                <Users size={18} />
                {live.participants.length}
                <span>participantes</span>
              </span>
            )}
          </div>
          {live && (
            <div className="moderator-session-actions">
              <span className="small muted">
                Controlás la ventana de proyección desde aquí.
              </span>
              <button
                className={`button secondary ${qrVisible ? "is-active" : ""}`}
                disabled={busy || ended}
                aria-pressed={qrVisible}
                onClick={() =>
                  void performAction(() => live.setQrVisible(!qrVisible))
                }
              >
                <QrCode size={18} />
                {qrVisible
                  ? "Ocultar QR de proyección"
                  : "Mostrar QR en proyección"}
              </button>
              <button className="button subtle" onClick={() => setShare(true)}>
                <ShareNetwork size={18} />
                Compartir
              </button>
            </div>
          )}
          <div className={live ? "moderator-stage-row" : undefined}>
            <div
              ref={stage}
              className={`presentation-area ${focusMode ? "focus-mode" : ""}`}
            >
              <div
                className={`projection-surface ${hasQuestion && !qrVisible ? "has-question" : ""}`}
                data-slide-theme={theme}
              >
                {qrVisible && sessionId ? (
                  <ProjectedQr sessionId={sessionId} />
                ) : (
                  <>
                    <div
                      className="slide-stage active-stage"
                      data-slide-theme={theme}
                      data-testid="active-slide"
                      data-motion-enabled={!!slide.ambientMotion}
                      data-motion-state={
                        slide.ambientMotion && motion.running
                          ? "running"
                          : "paused"
                      }
                    >
                      <Component key={slide.slug} />
                    </div>
                    {hasQuestion && slide.question && (
                      <ProjectedQuestion
                        question={slide.question}
                        votes={live?.votes ?? []}
                        slideSlug={slide.slug}
                        isLive={!!live}
                        votingOpen={votingOpen && !ended}
                        showResults={showResults}
                      />
                    )}
                  </>
                )}
              </div>
              <SlideControls
                activeIndex={activeIndex}
                slideCount={deck.slides.length}
                firstSlideNumber={firstSlideNumber}
                title={slide.title}
                busy={busy}
                ended={ended}
                focusMode={focusMode}
                isLive={!!live}
                theme={theme}
                ambientMotion={slide.ambientMotion}
                motionPaused={motion.paused}
                reducedMotion={motion.reducedMotion}
                onToggleMotion={motion.toggle}
                onToggleTheme={() => {
                  if (live && !busy && !ended)
                    void performAction(() =>
                      live.setProjectionTheme(
                        theme === "dark" ? "light" : "dark",
                      ),
                    );
                  else if (!live) toggleTheme();
                }}
                onMove={move}
                onFullscreen={() => void fullscreen()}
                onShare={() => setShare(true)}
              />
              {focusMode && share && sessionId && (
                <ShareModal
                  sessionId={sessionId}
                  deckSlug={deck.slug}
                  question={votingOpen ? slide.question?.prompt : undefined}
                  onClose={() => setShare(false)}
                />
              )}
            </div>
            {live && (
              <aside
                className="next-slide-preview"
                aria-label="Siguiente slide"
              >
                <p className="section-label">
                  {nextSlide ? "A CONTINUACIÓN" : "ÚLTIMA SLIDE"}
                </p>
                {nextSlide && NextComponent ? (
                  <>
                    <div
                      className="slide-stage"
                      data-slide-theme={theme}
                      aria-hidden="true"
                      inert
                    >
                      <NextComponent />
                    </div>
                    <p className="next-slide-title">
                      {formatSlideNumber(activeIndex + 1, firstSlideNumber)} ·{" "}
                      {nextSlide.title}
                    </p>
                    {nextSlide.speakerNotes && (
                      <p className="small muted">
                        {nextSlide.speakerNotes.timing}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="small muted">
                    Dejá este espacio para la conversación final.
                  </p>
                )}
              </aside>
            )}
          </div>
          {(actionError || live?.error) && (
            <div role="alert" className="error-message">
              {actionError || live?.error}
            </div>
          )}
          {ended && (
            <div className="notice">
              Esta sesión terminó. La audiencia conserva la última guía y ya no
              puede enviar respuestas.
            </div>
          )}
          <PresenterDetails
            slide={slide}
            standalone={standalone}
            isLive={!!live}
            busy={busy}
            ended={ended}
            votingOpen={votingOpen}
            votes={live?.votes ?? []}
            onQuestionOpen={(open) => {
              if (live) void performAction(() => live.setQuestionOpen(open));
            }}
          />
          {!standalone && <ConnectionNotice />}
        </main>
      </div>
      {share && !focusMode && sessionId && (
        <ShareModal
          sessionId={sessionId}
          deckSlug={deck.slug}
          question={votingOpen ? slide.question?.prompt : undefined}
          onClose={() => setShare(false)}
        />
      )}
      {confirmEnd && (
        <EndSessionModal
          busy={busy}
          onClose={() => setConfirmEnd(false)}
          onFinish={() => void finishSession()}
        />
      )}
      {accessOpen && (
        <PresenterAccessModal
          onAuthorize={authorizeAction}
          onClose={closeAccess}
        />
      )}
    </div>
  );
}
