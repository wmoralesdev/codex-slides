import { useEffect, useRef, useState, type RefObject } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  CheckCircle,
  Broadcast,
  LockSimple,
  ArrowUpRight,
  BookOpen,
  Users,
  Question as QuestionIcon,
} from "@phosphor-icons/react";
import { audienceRoute } from "../router";
import { useSession } from "../live/useSession";
import { useLive } from "../live/LiveProvider";
import type { Question, Session, Vote } from "../live/types";
import { Brand } from "../components/Shell";
import { Face } from "../devday/Face";
import { DEVDAY_EVENT } from "../devday/event";
import { createFace, FACE_PALETTE, FACE_PRESETS } from "../devday/faces";
import { QuestionResults } from "../components/QuestionResults";
import { AudienceNavigation } from "../components/audience/AudienceNavigation";
import { AudienceWelcome } from "../components/audience/AudienceWelcome";
import { PollNotification } from "../components/audience/PollNotification";
import { readStorage, storagePrefix, writeStorage } from "../live/credentials";
import { formatSlideNumber, getFirstSlideNumber } from "../decks/slideNumbers";
import "../components/audience/audience-experience.css";

export function AudiencePage() {
  const { sessionId } = audienceRoute.useParams();
  return <AudienceSession key={sessionId} sessionId={sessionId} />;
}

function AudienceSession({ sessionId }: { sessionId: string }) {
  const live = useSession(sessionId);
  const { mode } = useLive();
  const [joinError, setJoinError] = useState("");
  async function join() {
    setJoinError("");
    try {
      await live.join();
    } catch (e) {
      setJoinError(
        e instanceof Error ? e.message : "No pudimos asignarte un avatar.",
      );
    }
  }
  const { join: joinSession, participant } = live;
  const liveSessionId = live.session?.id;
  const sessionStatus = live.session?.status;
  useEffect(() => {
    if (!liveSessionId || participant || sessionStatus !== "live") return;
    let active = true;
    void joinSession().catch((e) => {
      if (active)
        setJoinError(
          e instanceof Error ? e.message : "No pudimos asignarte un avatar.",
        );
    });
    return () => {
      active = false;
    };
  }, [joinSession, liveSessionId, participant, sessionStatus]);
  const session = live.session;
  if (live.isLoading)
    return (
      <div className="audience-shell">
        <header className="audience-header">
          <Brand compact />
        </header>
        <main className="audience-main">
          <div className="loading-block" />
          <p>Preparando tu lugar…</p>
        </main>
      </div>
    );
  if (!session)
    return (
      <div className="audience-shell">
        <header className="audience-header">
          <Brand compact />
        </header>
        <main className="empty-page">
          <Face config={{ ...FACE_PRESETS.sleepy, color: FACE_PALETTE.orange }} className="empty-bot" />
          <h1>La sesión no está disponible.</h1>
          <p>
            {live.error ||
              (mode === "local"
                ? "En modo local, abre el enlace en el mismo navegador y con la misma dirección que el presentador."
                : "Revisa el enlace o pide el QR de la sesión actual.")}
          </p>
          <Link to="/" className="button primary">
            Ir a los decks <ArrowRight size={18} />
          </Link>
        </main>
      </div>
    );
  return (
    <AudienceGuide
      session={session}
      live={live}
      mode={mode}
      joinError={joinError}
      onRetryJoin={() => void join()}
    />
  );
}

function AudienceGuide({
  session,
  live,
  mode,
  joinError,
  onRetryJoin,
}: {
  session: Session;
  live: ReturnType<typeof useSession>;
  mode: "local" | "convex";
  joinError: string;
  onRetryJoin: () => void;
}) {
  // A manual location pauses follow, even if the presenter later reaches it.
  const [readingSlug, setReadingSlug] = useState<string | null>(null);
  const viewedSlug = readingSlug ?? session.activeSlideSlug;
  const welcomeKey = `${storagePrefix}:audience-welcome:${session.namespace}:${session.id}`;
  const [showWelcome, setShowWelcome] = useState(
    () => session.status === "live" && readStorage(welcomeKey) !== "seen",
  );
  const questionRef = useRef<HTMLElement>(null);
  const [questionFocusRequest, setQuestionFocusRequest] = useState(0);
  const presenterIndex = Math.max(
    0,
    session.slides.findIndex((s) => s.slug === session.activeSlideSlug),
  );
  const index = Math.max(
    0,
    session.slides.findIndex((s) => s.slug === viewedSlug),
  );
  const slide = session.slides[index];
  const firstSlideNumber = getFirstSlideNumber(session.slides);
  const ended = session.status === "ended";
  const following = readingSlug === null && !ended;
  const presenterQuestion = session.slides[presenterIndex].question;
  const isPresenterSlide = slide.slug === session.activeSlideSlug;
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [viewedSlug]);
  useEffect(() => {
    if (!questionFocusRequest) return;
    questionRef.current?.focus({ preventScroll: true });
    questionRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
  }, [questionFocusRequest]);

  function move(nextIndex: number) {
    if (nextIndex >= 0 && nextIndex < session.slides.length)
      setReadingSlug(session.slides[nextIndex].slug);
  }
  function catchUp() {
    setReadingSlug(null);
    window.scrollTo({ top: 0, behavior: "instant" });
  }
  function respondToPoll() {
    setReadingSlug(null);
    setQuestionFocusRequest((request) => request + 1);
  }
  function dismissWelcome() {
    writeStorage(welcomeKey, "seen");
    setShowWelcome(false);
  }
  const ownVote = live.votes.find(
    (v) =>
      v.slideSlug === slide.slug &&
      v.questionId === slide.question?.id &&
      v.participantId === live.participant?.id,
  );
  return (
    <div className="audience-shell">
      <header className="audience-header">
        <Brand compact />
        <div className="audience-header-actions">
          <span className="audience-live">
            <span className={`status-dot ${following ? "green" : ""}`} />
            {ended ? "Finalizada" : following ? "En vivo" : "A tu ritmo"}
          </span>
          {!ended && (
            <button
              className="icon-button audience-help"
              aria-label="Cómo funciona"
              onClick={() => setShowWelcome(true)}
            >
              <QuestionIcon size={21} />
            </button>
          )}
        </div>
      </header>
      <main className="audience-main">
        <div className="audience-identity">
          <div className="avatar-chip">
            <Face config={createFace(live.participant?.seed ?? 7)} />
          </div>
          <div>
            <span className="eyebrow">TU LUGAR EN LA CONVERSACIÓN</span>
            <strong>
              {live.participant?.name ||
                (ended ? "Visitante" : "Buscando tu avatar…")}
            </strong>
          </div>
          <span
            className="audience-people"
            aria-label={`${live.participants.length} participantes`}
          >
            <Users size={17} />
            {live.participants.length}
          </span>
        </div>
        {(joinError || live.error) && (
          <div className="error-message" role="alert">
            {joinError || live.error}
            {joinError && (
              <button className="button secondary" onClick={onRetryJoin}>
                Reintentar
              </button>
            )}
          </div>
        )}
        {ended && (
          <div className="notice">
            <strong>Gracias por ser parte.</strong>
            <br />
            La presentación terminó. Puedes seguir leyendo esta guía.
          </div>
        )}
        <div className="audience-progress">
          <span
            style={{ width: `${((index + 1) / session.slides.length) * 100}%` }}
          />
        </div>
        <div className="guide-meta">
          <span>{session.deckTitle}</span>
          <span>
            {formatSlideNumber(index, firstSlideNumber)} /{" "}
            {formatSlideNumber(session.slides.length - 1, firstSlideNumber)}
          </span>
        </div>
        <article className="audience-guide" key={slide.slug} aria-live="polite">
          <p className="eyebrow">{slide.kicker}</p>
          <h1>{slide.title}</h1>
          <p className="guide-intro">{slide.guide.intro}</p>
        </article>
        {slide.question && (
          <AudienceQuestion
            key={`${slide.slug}:${slide.question.id}`}
            sectionRef={questionRef}
            question={slide.question}
            slideSlug={slide.slug}
            open={session.questionOpen && !ended}
            ownVote={ownVote}
            votes={live.votes}
            showResults={isPresenterSlide && session.showResults}
            canVote={!!live.participant}
            closedMessage={
              ended
                ? "La presentación terminó. Ya no se reciben respuestas."
                : "El presentador cerró las preguntas."
            }
            onVote={live.vote}
          />
        )}
        <section className="guide-documentation">
          <p className="section-label">
            <BookOpen size={17} /> PARA LLEVAR CONTIGO
          </p>
          {slide.guide.sections?.map((section) => (
            <div className="guide-section" key={section.title}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </div>
          ))}
          {slide.guide.takeaway && (
            <blockquote>{slide.guide.takeaway}</blockquote>
          )}
        </section>
        <div className="following-note">
          <Broadcast size={17} />
          <span>
            {ended
              ? "Esta guía queda disponible para ti."
              : following
                ? "Estás en vivo. Las slides avanzan con el presentador."
                : "Estás leyendo a tu ritmo. Tocá «Volver al vivo» para seguir al presentador."}
          </span>
        </div>
        {mode === "local" && (
          <p className="audience-local">
            No ha sido configurado Convex · Vista de prueba local.
          </p>
        )}
        <footer className="audience-footer">
          <span>{DEVDAY_EVENT.hashtag} · {DEVDAY_EVENT.city}</span>
          <Link to="/">
            DevDay Slides <ArrowUpRight size={13} />
          </Link>
        </footer>
      </main>
      <AudienceNavigation
        index={index}
        presenterIndex={presenterIndex}
        slideCount={session.slides.length}
        firstSlideNumber={firstSlideNumber}
        questionOpen={session.questionOpen && !!presenterQuestion}
        ended={ended}
        following={following}
        onMove={move}
        onCatchUp={catchUp}
        notification={
          !ended && session.questionOpen && presenterQuestion ? (
            <PollNotification
              key={`${session.activeSlideSlug}:${presenterQuestion.id}:${session.questionOpenedAt ?? "legacy"}`}
              prompt={presenterQuestion.prompt}
              onRespond={respondToPoll}
            />
          ) : null
        }
      />
      {showWelcome && !ended && <AudienceWelcome onContinue={dismissWelcome} />}
    </div>
  );
}

function AudienceQuestion({
  sectionRef,
  question,
  slideSlug,
  open,
  ownVote,
  votes,
  showResults,
  canVote,
  closedMessage,
  onVote,
}: {
  sectionRef: RefObject<HTMLElement | null>;
  question: Question;
  slideSlug: string;
  open: boolean;
  ownVote?: Vote;
  votes: Vote[];
  showResults: boolean;
  canVote: boolean;
  closedMessage: string;
  onVote: (options: string[], slideSlug: string) => Promise<void>;
}) {
  const [selected, setSelected] = useState<string[]>(ownVote?.optionIds ?? []);
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const displayed = dirty ? selected : (ownVote?.optionIds ?? selected);
  const selectedOptions = new Set(displayed);
  function toggle(id: string) {
    setDirty(true);
    setSelected(
      question.type === "multiple"
        ? displayed.includes(id)
          ? displayed.filter((x) => x !== id)
          : [...displayed, id]
        : [id],
    );
  }
  async function submit() {
    if (!open || !canVote || busy || !displayed.length) return;
    setBusy(true);
    setError("");
    try {
      await onVote(displayed, slideSlug);
      setDirty(false);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "No pudimos enviar tu respuesta.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <section
      ref={sectionRef}
      className="audience-question"
      tabIndex={-1}
      aria-label={question.prompt}
    >
      <div className="audience-question-heading">
        <span className="eyebrow">
          <span className={`status-dot ${open ? "green" : ""}`} />
          {open ? "TU VOZ CUENTA" : "PREGUNTA CERRADA"}
        </span>
        {ownVote && (
          <span className="answered-badge">
            <CheckCircle size={16} />
            Respondida
          </span>
        )}
      </div>
      <h2>{question.prompt}</h2>
      <p className="small muted">
        {question.type === "multiple"
          ? "Puedes elegir varias opciones."
          : "Elige una opción."}
      </p>
      <fieldset disabled={!open || busy || !canVote} className="answer-options">
        <legend className="sr-only">{question.prompt}</legend>
        {question.options.map((option) => (
          <label
            key={option.id}
            className={`answer-option ${selectedOptions.has(option.id) ? "is-selected" : ""}`}
          >
            <input
              type={question.type === "multiple" ? "checkbox" : "radio"}
              name={question.id}
              value={option.id}
              checked={selectedOptions.has(option.id)}
              onChange={() => toggle(option.id)}
            />
            <span>{option.label}</span>
            {selectedOptions.has(option.id) && <Check size={18} />}
          </label>
        ))}
      </fieldset>
      {open ? (
        <button
          className="button primary full-width"
          disabled={
            !canVote || !displayed.length || busy || (!!ownVote && !dirty)
          }
          onClick={() => void submit()}
        >
          {busy
            ? "Enviando…"
            : ownVote && !dirty
              ? "Respuesta enviada"
              : ownVote
                ? "Actualizar respuesta"
                : "Enviar respuesta"}
          {ownVote && !dirty ? (
            <CheckCircle size={18} />
          ) : (
            <ArrowRight size={18} />
          )}
        </button>
      ) : (
        <p className="question-closed">
          <LockSimple size={16} />
          {closedMessage}
        </p>
      )}
      {error && (
        <p role="alert" className="error-message">
          {error}
        </p>
      )}
      {ownVote && !dirty && open && (
        <p role="status" className="vote-confirmation">
          Listo. Puedes cambiar tu respuesta mientras siga abierta.
        </p>
      )}
      {showResults && (
        <>
          <div className="results-heading">Así piensa la sala</div>
          <QuestionResults
            question={question}
            votes={votes}
            slideSlug={slideSlug}
          />
        </>
      )}
    </section>
  );
}
