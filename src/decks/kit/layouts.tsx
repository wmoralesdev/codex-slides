import type { CSSProperties, ReactNode } from "react";
import { Face, Mark } from "../../devday/Face";
import { AiLabsLogo, CodexWordmark, OpenAILogo, OpenAIWordmark, PortalXLogo } from "../../devday/Brand";
import { DEVDAY_EVENT } from "../../devday/event";
import { firstName, type Speaker } from "../../devday/speakers";
import { FACE_PALETTE, type FaceConfig } from "../../devday/faces";
import { Crowd } from "./Crowd";
import { closingCrowd, coverCrowd, coverMarks, speakerCluster } from "./crowd-layout";
import { useSlideInfo } from "./SlideInfo";
import type { TalkBrief } from "./talk";
import "./kit.css";

/* ------------------------------------------------------------------ */
/* Building blocks: use these inside your own slides.                  */
/* ------------------------------------------------------------------ */

/** Every DevDay slide: 16:9 canvas, event footer with the speaker's face and the slide number. */
export function SlideFrame({
  children,
  className = "",
  label,
  footer = true,
}: {
  children: ReactNode;
  className?: string;
  /** Accessible name of the slide; defaults to nothing (the heading names it). */
  label?: string;
  footer?: boolean;
}) {
  const info = useSlideInfo();
  return (
    <section className={`slide-canvas dd-slide ${className}`} aria-label={label}>
      {children}
      {footer && (
        <footer className="dd-footer">
          <span className="dd-footer-who">
            {info?.speaker && (
              <span className="dd-footer-face" aria-hidden="true">
                <Face config={info.speaker.face} />
              </span>
            )}
            {info?.speaker ? `${info.speaker.name} · ` : ""}
            {info?.deckTitle ?? `${DEVDAY_EVENT.name} ${DEVDAY_EVENT.city}`}
          </span>
          <span className="dd-footer-event">
            {DEVDAY_EVENT.name} {DEVDAY_EVENT.city}
            {info && (
              <span className="dd-footer-number">
                {info.number}
                <span> / {info.total}</span>
              </span>
            )}
          </span>
        </footer>
      )}
    </section>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="dd-eyebrow">{children}</p>;
}

/** Tag in the event palette, e.g. the announcement a talk builds on. */
export function Pill({ children, color }: { children: ReactNode; color?: string }) {
  return (
    <span className="dd-pill" style={color ? ({ "--pill": color } as CSSProperties) : undefined}>
      {children}
    </span>
  );
}

/** A face in slide units (cqw). Decorative: put the name in visible text. */
export function SlideFace({
  face,
  size,
  className = "",
  style,
}: {
  face: FaceConfig;
  size: number;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span className={`dd-face ${className}`} style={{ "--size": `${size}cqw`, ...style } as CSSProperties} aria-hidden="true">
      <Face config={face} />
    </span>
  );
}

export type CardItem = {
  title: string;
  body?: string;
  face?: FaceConfig;
  /** Fills the card with an event color; text turns white on charcoal. */
  color?: string;
  tag?: string;
};

/** 2–4 cards in a row: comparisons, announcements, options. */
export function Cards({ items, columns = items.length }: { items: CardItem[]; columns?: number }) {
  return (
    <div className="dd-cards" style={{ "--columns": columns } as CSSProperties}>
      {items.map((item) => (
        <article
          key={item.title}
          className={`dd-card ${item.color ? "dd-card--filled" : ""} ${item.color === FACE_PALETTE.charcoal ? "dd-card--night" : ""}`}
          style={item.color ? ({ "--card": item.color } as CSSProperties) : undefined}
        >
          {item.tag && <span className="dd-card-tag">{item.tag}</span>}
          <h3>{item.title}</h3>
          {item.body && <p>{item.body}</p>}
          {item.face && <SlideFace face={item.face} size={6.4} className="dd-card-face" />}
        </article>
      ))}
    </div>
  );
}

/** A numbered sequence: a flow, a demo, a recipe. */
export function Steps({ items, columns = items.length }: { items: { title: string; body?: string }[]; columns?: number }) {
  return (
    <ol className="dd-steps" style={{ "--columns": columns } as CSSProperties}>
      {items.map((item, index) => (
        <li key={item.title}>
          <span className="dd-step-number">{String(index + 1).padStart(2, "0")}</span>
          <h3>{item.title}</h3>
          {item.body && <p>{item.body}</p>}
        </li>
      ))}
    </ol>
  );
}

/* ------------------------------------------------------------------ */
/* Complete slides shared by every deck.                               */
/* ------------------------------------------------------------------ */

/** Slide 00: the holding screen while people take their seats. */
export function DevDayCoverSlide() {
  return (
    <section className="slide-canvas dd-slide dd-cover" aria-label={`OpenAI ${DEVDAY_EVENT.name} ${DEVDAY_EVENT.city}, organizado por ${DEVDAY_EVENT.organizer}`}>
      <Crowd faces={coverCrowd} marks={coverMarks} className="dd-cover-crowd" />
      <div className="dd-cover-title">
        <OpenAILogo className="dd-cover-openai" />
        <h1>
          {DEVDAY_EVENT.name}
          <br />
          {DEVDAY_EVENT.edition}
        </h1>
      </div>
      <div className="dd-cover-meta">
        <span>
          {DEVDAY_EVENT.city} · {DEVDAY_EVENT.venue} · {DEVDAY_EVENT.date}
        </span>
        <span className="dd-cover-brands">
          <CodexWordmark className="dd-cover-codex" />
          <span className="dd-cover-rule" aria-hidden="true" />
          <span className="dd-cover-org">Organiza</span>
          <AiLabsLogo className="dd-cover-ailabs" />
          <span className="dd-cover-rule" aria-hidden="true" />
          <span className="dd-cover-org">Media partner</span>
          <PortalXLogo className="dd-cover-portalx" />
        </span>
      </div>
    </section>
  );
}

/** Slide 01 of a talk: title, speaker and the announcement it builds on. */
export function TalkCover({ title, topic, speaker, accent }: { title: string; topic: string; speaker: Speaker; accent: string }) {
  const cluster = speakerCluster(speaker.face);
  return (
    <SlideFrame className="dd-talk-cover">
      <Crowd faces={cluster.faces} marks={cluster.marks} className="dd-talk-cover-crowd" />
      <div className="dd-talk-cover-top">
        <OpenAIWordmark className="dd-talk-cover-openai" />
        <span className="dd-talk-cover-rule" aria-hidden="true" />
        <span className="dd-talk-cover-event">
          {DEVDAY_EVENT.name} {DEVDAY_EVENT.city}
        </span>
      </div>
      <Pill color={accent}>{topic}</Pill>
      <h1 className="dd-display">{title}</h1>
      <div className="dd-talk-cover-speaker">
        <SlideFace face={speaker.face} size={4.6} />
        <div>
          <strong>{speaker.name}</strong>
          <span>{speaker.role ?? "Speaker"}</span>
        </div>
      </div>
    </SlideFrame>
  );
}

/** Slide 02 summarizes the scope; detailed preparation cues live in presenter notes. */
export function TalkBriefSlide({ speaker, brief, pending = false }: { speaker: Speaker; brief: TalkBrief; pending?: boolean }) {
  return (
    <SlideFrame className="dd-brief">
      <Eyebrow>{speaker.name} · {pending ? "Por definir" : "El recorrido de la charla"}</Eyebrow>
      <h2 className="dd-heading">{brief.goal}</h2>
      <div className="dd-brief-body">
        <section className="dd-brief-topics">
          <h3>Qué vamos a recorrer</h3>
          <ol>{brief.topics.map((topic) => <li key={topic}>{topic}</li>)}</ol>
        </section>
        <section className="dd-brief-demo">
          <h3>{pending ? "Enfoque pendiente" : "Demo o enfoque"}</h3>
          <p>{brief.demo}</p>
          <SlideFace face={speaker.face} size={4.8} />
        </section>
      </div>
      <p className="dd-brief-takeaway"><strong>{pending ? "Próximo paso" : "Te llevás"}</strong>{brief.takeaway}</p>
    </SlideFrame>
  );
}

/** "Un gusto, soy…": a speaker badge with the portrait when there is one, the face otherwise. */
export function SpeakerIntro({ speaker, about }: { speaker: Speaker; about: string }) {
  const [first, ...rest] = speaker.name.split(" ");
  return (
    <SlideFrame className="dd-speaker">
      <div className="dd-speaker-text">
        <Eyebrow>Un gusto, soy {firstName(speaker)}</Eyebrow>
        <h1 className="dd-display">
          {first}
          <br />
          {rest.join(" ")}
        </h1>
        <p className="dd-lead">{speaker.role ?? "Speaker · DevDay Exchange San Salvador"}</p>
        <p className="dd-speaker-about">{about}</p>
      </div>
      <div className={`dd-badge ${speaker.photo ? "dd-badge--photo" : ""}`}>
        <span className="dd-badge-mark dd-badge-mark--heart" aria-hidden="true">
          <Mark kind="heart" color={FACE_PALETTE.blue} />
        </span>
        <span className="dd-badge-mark dd-badge-mark--exclaim" aria-hidden="true">
          <Mark kind="exclaim" color={FACE_PALETTE.green} />
        </span>
        {speaker.photo ? (
          <>
            <img className="dd-badge-photo" src={speaker.photo} alt={`Retrato de ${speaker.name}`} draggable={false} />
            <SlideFace face={speaker.face} size={9} className="dd-badge-face" />
          </>
        ) : (
          <SlideFace face={speaker.face} size={23} className="dd-badge-face" />
        )}
        <span className="dd-badge-tag">
          <span>Speaker</span>
          {DEVDAY_EVENT.date}
        </span>
      </div>
    </SlideFrame>
  );
}

/** Placeholder for a slide whose title is decided but whose content the speaker still has to build. */
export function DraftSlide({ kicker, title, intro, speaker }: { kicker: string; title: string; intro: string; speaker: Speaker }) {
  return (
    <SlideFrame className="dd-draft">
      <Eyebrow>{kicker}</Eyebrow>
      <h2 className="dd-heading">{title}</h2>
      <div className="dd-draft-wrap">
        <SlideFace
          face={{ ...speaker.face, expression: "curious", rotation: 0, eyeScale: 0.95, gaze: { x: -0.2, y: 0.45 } }}
          size={8}
          className="dd-draft-peek"
        />
        <div className="dd-draft-area">
          <div className="dd-draft-text">
            <span className="dd-draft-tag">Contenido pendiente · {firstName(speaker)}</span>
            <p>{intro}</p>
          </div>
          <div className="dd-draft-ghost" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </SlideFrame>
  );
}

/** Last slide of a talk: the crowd looks up at the question. */
export function ClosingSlide({ speaker, title }: { speaker: Speaker; title: string }) {
  return (
    <SlideFrame className="dd-closing" footer={false}>
      <Crowd faces={closingCrowd({ x: 40, y: 18 })} className="dd-closing-crowd" />
      <Eyebrow>{title}</Eyebrow>
      <h1 className="dd-display">
        ¿Preguntas?
        <SlideFace face={{ ...speaker.face, gaze: { x: -0.3, y: 0.35 } }} size={9} className="dd-closing-face" />
      </h1>
      <p className="dd-lead">
        Gracias. Seguimos la conversación en la terraza con <strong>{DEVDAY_EVENT.hashtag}</strong>.
      </p>
    </SlideFrame>
  );
}
