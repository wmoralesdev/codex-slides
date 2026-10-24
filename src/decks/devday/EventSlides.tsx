import { useEffect, useRef, useState } from "react";
import { Face } from "../../devday/Face";
import { FACE_PALETTE, FACE_PRESETS } from "../../devday/faces";
import { DEVDAY_EVENT, devdayHighlights } from "../../devday/event";
import { AiLabsLogo, CodexWordmark, OpenAIWordmark } from "../../devday/Brand";
import { talkDecks } from "../talks";
import { Crowd } from "../kit/Crowd";
import type { CrowdFace } from "../kit/crowd-layout";
import { Cards, Eyebrow, Pill, SlideFace, SlideFrame, Steps } from "../kit/layouts";
import "./event.css";

const { blue, green, orange, purple, gray, charcoal } = FACE_PALETTE;

const welcomeCrowd: CrowdFace[] = [
  { x: 74, y: 20, size: 17, face: { ...FACE_PRESETS.happy, color: charcoal, rotation: -10 } },
  { x: 88.5, y: 12, size: 10, face: { ...FACE_PRESETS.squeeze, color: blue } },
  { x: 90, y: 31, size: 13, face: { ...FACE_PRESETS.plus, color: green, gaze: { x: -0.3, y: 0.2 } } },
  { x: 64, y: 34, size: 8, face: { ...FACE_PRESETS.sleepy, color: orange, gaze: { x: 0.2, y: -0.6 } } },
  { x: 78, y: 41, size: 6.5, face: { ...FACE_PRESETS.curious, color: purple, gaze: { x: -0.1, y: -0.4 } } },
  { x: 99, y: 46, size: 12, face: { ...FACE_PRESETS.spark, color: gray, gaze: { x: -0.4, y: -0.3 } } },
];

export function WelcomeSlide() {
  return (
    <SlideFrame className="ev-welcome">
      <Crowd faces={welcomeCrowd} />
      <OpenAIWordmark className="ev-welcome-openai" />
      <h1 className="dd-display">
        Una tarde para
        <br />
        construir con IA.
      </h1>
      <p className="dd-lead">
        Ideas para tu trabajo, tus estudios o tu proyecto. Cinco temas propuestos y uno por confirmar, con demos que podés seguir sin saber programar.
      </p>
      <ul className="ev-facts">
        <li>{DEVDAY_EVENT.dateLong}</li>
        <li>{DEVDAY_EVENT.venue}</li>
        <li className="ev-facts-org">
          Organiza <AiLabsLogo className="ev-facts-ailabs" />
        </li>
      </ul>
    </SlideFrame>
  );
}

export function AnnouncementsSlide() {
  return (
    <SlideFrame className="ev-announcements">
      <Eyebrow>DevDay 2026 · 29 de septiembre</Eyebrow>
      <h2 className="dd-heading">Lo que DevDay cambia en tu día a día.</h2>
      <Cards
        columns={3}
        items={devdayHighlights.map((item, index) => ({
          ...item,
          color: [blue, orange, gray, green, purple, charcoal][index],
        }))}
      />
    </SlideFrame>
  );
}

export function AgendaSlide() {
  return (
    <SlideFrame className="ev-agenda">
      <Eyebrow>La agenda de hoy</Eyebrow>
      <h2 className="dd-heading">Cinco temas y un espacio por confirmar.</h2>
      <ol className="ev-agenda-list">
        {talkDecks.map((talk, index) => (
          <li key={talk.slug}>
            <span className="ev-agenda-number">{String(index + 1).padStart(2, "0")}</span>
            {talk.speaker && (
              <span className="ev-agenda-face" aria-hidden="true">
                <Face config={talk.speaker.face} />
              </span>
            )}
            <div>
              <strong>{talk.title}</strong>
              <span>
                {talk.speaker?.name} · {talk.category}
              </span>
            </div>
          </li>
        ))}
      </ol>
    </SlideFrame>
  );
}

export function JoinSlide() {
  const results = [
    { label: "Todos los días", value: 46 },
    { label: "Algunas veces por semana", value: 31 },
    { label: "Estoy empezando", value: 23 },
  ];
  return (
    <SlideFrame className="ev-join">
      <div className="ev-join-text">
        <Eyebrow>Participá desde tu teléfono</Eyebrow>
        <h2 className="dd-heading">Cada charla tiene su guía y sus preguntas.</h2>
        <Steps
          columns={1}
          items={[
            { title: "Escaneá el QR", body: "Aparece en pantalla al empezar cada charla. Sin registro." },
            { title: "Seguí la guía", body: "Cambia con cada slide; podés leer a tu ritmo y volver al vivo." },
            { title: "Respondé", body: "Te llega un aviso cuando se abre una encuesta y ves los resultados." },
          ]}
        />
      </div>
      <div className="ev-phone" aria-hidden="true">
        <div className="ev-phone-screen">
          <div className="ev-phone-bar">
            <span className="ev-phone-brand">
              <Face config={{ ...FACE_PRESETS.squeeze, color: blue }} />
              DevDay Slides
            </span>
            <span className="ev-phone-live">En vivo</span>
          </div>
          <div className="ev-phone-who">
            <Face config={{ ...FACE_PRESETS.curious, color: purple }} />
            <span>
              <small>Tu lugar</small>
              Lobo Valiente
            </span>
          </div>
          <p className="ev-phone-kicker">Bienvenida · 1:00</p>
          <p className="ev-phone-title">Una tarde para construir con IA</p>
          <p className="ev-phone-intro">
            Bienvenido a DevDay Exchange San Salvador, un evento de comunidad organizado por Ai Labs.
          </p>
          <div className="ev-phone-poll">
            <p>¿Cuánto usás IA para construir hoy?</p>
            {results.map((row) => (
              <div key={row.label} className="ev-phone-row">
                <span style={{ width: `${row.value}%` }} />
                <em>{row.label}</em>
                <strong>{row.value}%</strong>
              </div>
            ))}
          </div>
        </div>
        <span className="ev-phone-note">Ejemplo</span>
      </div>
      <SlideFace face={{ ...FACE_PRESETS.happy, color: orange, rotation: -14, gaze: { x: -0.4, y: -0.1 } }} size={7.5} className="ev-join-face" />
    </SlideFrame>
  );
}

export function AfterSlide() {
  return (
    <SlideFrame className="ev-after">
      <Eyebrow>Después de las charlas</Eyebrow>
      <p className="ev-hashtag">
        <span className="ev-hash">#</span>DevDayC
        <span className="ev-hashtag-o">
          <Face config={{ ...FACE_PRESETS.happy, color: blue, rotation: 0 }} />
        </span>
        mmunity
      </p>
      <p className="dd-lead">
        La conversación sigue en la terraza. Contá qué te llevás y etiquetá a quien conociste hoy.
      </p>
      <div className="ev-after-brands">
        <Pill color={green}>Codex en acción</Pill>
        <CodexWordmark className="ev-after-codex" />
        <AiLabsLogo className="ev-after-ailabs" />
      </div>
      <SlideFace face={{ ...FACE_PRESETS.plus, color: green, gaze: { x: -0.3, y: -0.2 } }} size={13} className="ev-after-face" />
    </SlideFrame>
  );
}

/**
 * Full-screen community demo for a pause. Thumbnails keep the poster; the presenter's
 * preview plays muted so the room hears only the projected stage.
 */
function PauseVideo({ id, label }: { id: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [onStage, setOnStage] = useState(false);
  useEffect(() => {
    const video = ref.current;
    const stage = video?.closest<HTMLElement>("[data-motion-enabled]");
    if (!video || !stage) return;
    setOnStage(true);
    video.src = `/demos/${id}.mp4`;
    video.muted = stage.dataset.testid === "active-slide";
    const sync = () => {
      if (stage.dataset.motionState === "running") void video.play().catch(() => undefined);
      else video.pause();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(stage, { attributes: true, attributeFilter: ["data-motion-state"] });
    return () => observer.disconnect();
  }, [id]);
  return (
    <video
      ref={ref}
      className="ev-pause-video"
      poster={`/demos/${id}-poster.jpg`}
      playsInline
      preload="none"
      controls={onStage}
      aria-label={label}
    />
  );
}

export function makePauseDemoSlide(id: string, label: string) {
  function PauseDemoSlide() {
    return (
      <SlideFrame className="ev-pause-demo" label={label} footer={false}>
        <PauseVideo id={id} label={label} />
      </SlideFrame>
    );
  }
  return PauseDemoSlide;
}
