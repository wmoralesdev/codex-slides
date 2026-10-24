import type { CSSProperties } from "react";
import { Mark } from "../../devday/Face";
import { CodexWordmark } from "../../devday/Brand";
import { DEVDAY_EVENT } from "../../devday/event";
import { FACE_PALETTE, FACE_PRESETS, createFace, type FaceConfig } from "../../devday/faces";
import { Crowd } from "../kit/Crowd";
import { closingCrowd, lookAt, type CrowdFace } from "../kit/crowd-layout";
import { Eyebrow, Pill, SlideFace, SlideFrame, Steps } from "../kit/layouts";
import { useSlideInfo } from "../kit/SlideInfo";
import autoshopShot from "./assets/autoshop.webp";
import limaShot from "./assets/lima.webp";
import qrBorea from "./assets/qr-borea.webp";
import rokaShot from "./assets/roka.webp";
import "./agents-api.css";

const { blue, green, orange, purple, charcoal } = FACE_PALETTE;

/** The four layers of the talk. Slide 04 stacks them; slides 05–12 use them as eyebrows. */
export const LAYERS = [
  { name: "Contexto", body: "Qué sabe el agente", color: blue },
  { name: "Brief", body: "Qué tiene que hacer", color: green },
  { name: "Revisión", body: "Cómo sabés que está bien", color: orange },
  { name: "Memoria", body: "Lo aprendido", color: purple },
];

/** The same four lines on slide 06 (the manual) and slide 12 (the manual, one rule later). */
const MANUAL_LINES = [
  { mark: "#", text: "Quiénes somos" },
  { mark: "#", text: "Cómo trabajamos" },
  { mark: "-", text: "Nunca guardes contraseñas aquí" },
  { mark: "-", text: "Antes de entregar, pedí una revisión" },
];

function Topo({ className = "" }: { className?: string }) {
  return <span className={`an-topo ${className}`} aria-hidden="true" />;
}

function Paper({ added }: { added?: string }) {
  return (
    <div className={`an-paper ${added ? "an-paper--later" : ""}`}>
      <span className="an-paper-name">AGENTS.md</span>
      <ul>
        {MANUAL_LINES.map((line) => (
          <li key={line.text}>
            <span className="an-paper-mark">{line.mark}</span>
            {line.text}
          </li>
        ))}
        {added && (
          <li className="an-paper-added">
            <span className="an-paper-mark">-</span>
            {added}
          </li>
        )}
      </ul>
    </div>
  );
}

/* 03 · Pocas personas. Muchos agentes. */
const people: CrowdFace[] = [
  { x: 61, y: 21, size: 9, face: { ...FACE_PRESETS.happy, color: charcoal, rotation: 6, gaze: { x: 0.35, y: 0.1 } } },
  { x: 73, y: 18, size: 11, face: { ...FACE_PRESETS.squeeze, color: blue, rotation: -8 } },
  { x: 85, y: 21.5, size: 9, face: { ...FACE_PRESETS.wink, color: orange, gaze: { x: -0.3, y: 0.1 } } },
];
const agents: CrowdFace[] = Array.from({ length: 28 }, (_, index) => {
  const column = index % 7;
  const row = Math.floor(index / 7);
  const spot = { x: 55.5 + column * 5.4 + (row % 2) * 2.7, y: 33.5 + row * 4.4 };
  return { ...spot, size: 3.4, face: lookAt(createFace(index * 7 + 3), spot, { x: 73, y: 18 }, 0.6) };
});

export function PeopleAndAgentsSlide() {
  return (
    <SlideFrame className="an-people">
      <Crowd faces={[...people, ...agents]} />
      <Eyebrow>Borea Labs · 0:45</Eyebrow>
      <span className="an-group-label" style={{ "--x": "73cqw", "--y": "8.6cqw" } as CSSProperties}>Personas</span>
      <span className="an-group-label" style={{ "--x": "73cqw", "--y": "49.4cqw" } as CSSProperties}>Agentes</span>
      <h2 className="dd-heading an-narrow">
        Pocas personas.
        <br />
        Muchos agentes.
      </h2>
      <p className="dd-lead an-narrow">Borea Labs: un fundador, algunos colaboradores y un equipo de agentes.</p>
    </SlideFrame>
  );
}

/* 04 · Usar IA no te hace AI-native. */
export function InfrastructureSlide() {
  return (
    <SlideFrame className="an-layers-slide">
      <Topo className="an-topo--corner" />
      <Eyebrow>La idea · 0:45</Eyebrow>
      <h2 className="dd-heading">Usar IA no te hace AI-native. Tener infraestructura, sí.</h2>
      <ol className="an-layers">
        {[...LAYERS].reverse().map((layer, index) => (
          <li key={layer.name} style={{ "--layer": layer.color, "--step": 3 - index } as CSSProperties}>
            <span className="an-layer-number">{String(4 - index).padStart(2, "0")}</span>
            <strong>{layer.name}</strong>
            <span>{layer.body}</span>
          </li>
        ))}
      </ol>
    </SlideFrame>
  );
}

/* 05 · Sin contexto, un agente empieza como un empleado nuevo. */
export function NewHireSlide() {
  return (
    <SlideFrame className="an-newhire">
      <Eyebrow>Contexto · 0:45</Eyebrow>
      <h2 className="dd-heading an-narrow">Sin contexto, un agente empieza como un empleado nuevo.</h2>
      <p className="dd-lead an-narrow an-bottom">No sabe quiénes son tus clientes, cómo trabajás ni qué ya salió mal.</p>
      <div className="an-desk" aria-hidden="true">
        <SlideFace face={{ ...FACE_PRESETS.curious, color: purple, gaze: { x: -0.15, y: -0.1 } }} size={15} className="an-desk-face" />
        <span className="an-desk-mark an-desk-mark--a"><Mark kind="question" color={orange} /></span>
        <span className="an-desk-mark an-desk-mark--b"><Mark kind="question" color={green} /></span>
        <span className="an-desk-mark an-desk-mark--c"><Mark kind="question" color={blue} /></span>
        <span className="an-desk-top" />
        <span className="an-desk-paper" />
      </div>
    </SlideFrame>
  );
}

/* 06 · AGENTS.md es el manual del empleado, para agentes. */
export function ManualSlide() {
  return (
    <SlideFrame className="an-manual">
      <Eyebrow>Contexto · 1:30</Eyebrow>
      <h2 className="dd-heading">AGENTS.md es el manual del empleado, para agentes.</h2>
      <div className="an-manual-pair">
        <Paper />
        <span className="an-equals" aria-hidden="true">=</span>
        <div className="an-booklet">
          <span className="an-booklet-title">Manual del empleado</span>
          <ol>
            {MANUAL_LINES.map((line) => <li key={line.text}>{line.text}</li>)}
          </ol>
        </div>
      </div>
      <p className="an-caption">
        Un archivo de texto en tu proyecto. <CodexWordmark className="an-inline-codex" /> lo lee antes de empezar.
      </p>
    </SlideFrame>
  );
}

/* 07 · Todo el contexto vive en un solo lugar. Label positions match MAP_REGIONS in HQ's make-assets.js. */
const regions = [
  { name: "Estrategia", x: 0.2, y: 0.38 },
  { name: "Clientes", x: 0.52, y: 0.24 },
  { name: "Procedimientos", x: 0.8, y: 0.46 },
  { name: "Decisiones", x: 0.44, y: 0.76 },
];

export function MapSlide() {
  return (
    <SlideFrame className="an-map-slide">
      <Eyebrow>Contexto · 1:00</Eyebrow>
      <h2 className="dd-heading">Todo el contexto vive en un solo lugar.</h2>
      <div className="an-map-row">
        <div className="an-map">
          <Topo className="an-topo--map" />
          {regions.map((region) => (
            <span key={region.name} className="an-map-pin" style={{ "--x": `${region.x * 100}%`, "--y": `${region.y * 100}%` } as CSSProperties}>
              {region.name}
            </span>
          ))}
        </div>
        <dl className="an-outside">
          <dt>Fuera del mapa</dt>
          <dd><strong>Tareas</strong> su propia herramienta</dd>
          <dd><strong>Código</strong> proyectos separados</dd>
          <dd><strong>Contraseñas</strong> nunca aquí</dd>
        </dl>
      </div>
    </SlideFrame>
  );
}

/* 08 · El trabajo ya no es hacer la tarea. Es escribir el brief. */
const briefSections = [
  { title: "Objetivo", body: "Una sola versión del cálculo en todos los productos." },
  { title: "Límites", body: "Trabajar en una versión separada. No tocar nada más." },
  { title: "Listo cuando…", body: "El programa funciona y el resultado coincide con el original." },
  { title: "Cómo se deshace", body: "Un solo paso para volver atrás, probado." },
  { title: "Entregable", body: "Cambios, pruebas y riesgos pendientes." },
];

export function BriefSlide() {
  return (
    <SlideFrame className="an-brief">
      <div className="an-brief-text">
        <Eyebrow>Brief · 1:30</Eyebrow>
        <h2 className="dd-heading">El trabajo ya no es hacer la tarea. Es escribir el brief.</h2>
        <Pill color={green}>Adaptado de un brief real</Pill>
      </div>
      <article className="an-doc" aria-label="Ejemplo de brief">
        <header>
          <span className="an-doc-dots" aria-hidden="true"><i /><i /><i /></span>
          <span>brief.md</span>
        </header>
        <h3>Brief</h3>
        {briefSections.map((section) => (
          <section key={section.title}>
            <h4>{section.title}</h4>
            <p>{section.body}</p>
          </section>
        ))}
      </article>
    </SlideFrame>
  );
}

/* 09 · Cuatro rondas de revisión lo aprobaron. Deshacerlo lo rompía. */
export function NotReadySlide() {
  return (
    <SlideFrame className="an-timeline-slide">
      <Eyebrow>Revisión · 1:30</Eyebrow>
      <h2 className="dd-heading">Cuatro rondas de revisión lo aprobaron. Deshacerlo lo rompía.</h2>
      <ol className="an-timeline">
        <li>
          <span className="an-timeline-icon an-timeline-icon--undo" aria-hidden="true">↺</span>
          <p>Un cambio que debía poder deshacerse</p>
        </li>
        <li>
          <span className="an-checks" aria-hidden="true">{[0, 1, 2, 3].map((n) => <i key={n}>✓</i>)}</span>
          <p>4 rondas de revisión: aprobado</p>
        </li>
        <li className="an-timeline-fail">
          <span className="an-timeline-icon an-timeline-icon--fail" aria-hidden="true">✕</span>
          <p>Al deshacerlo, dejaba de funcionar</p>
        </li>
      </ol>
      <p className="an-caption an-caption--face">
        <SlideFace face={{ ...FACE_PRESETS.curious, color: purple, gaze: { x: 0.2, y: -0.2 } }} size={3.6} />
        Lo encontró un revisor que no había participado.
      </p>
    </SlideFrame>
  );
}

/* 10 · Quien escribe no aprueba. */
export function ReviewerSlide() {
  return (
    <SlideFrame className="an-split">
      <Eyebrow>Revisión · 1:00</Eyebrow>
      <h2 className="dd-heading">Quien escribe no aprueba.</h2>
      <div className="an-split-row">
        <figure>
          <SlideFace face={{ ...FACE_PRESETS.sleepy, color: orange, gaze: { x: 0.35, y: 0.6 } }} size={13} />
          <figcaption>
            <strong>Autor</strong>
            <span>Hace el trabajo</span>
          </figcaption>
        </figure>
        <span className="an-split-rule" aria-hidden="true" />
        <figure>
          <span className="an-split-face">
            <SlideFace face={{ ...FACE_PRESETS.curious, color: purple, gaze: { x: -0.45, y: 0.05 } }} size={13} />
            <span className="an-split-mark"><Mark kind="exclaim" color={green} /></span>
          </span>
          <figcaption>
            <strong>Revisor</strong>
            <span className="an-pills">
              <Pill color={purple}>Otro modelo</Pill>
              <Pill color={purple}>Otra sesión</Pill>
              <Pill color={purple}>Solo lectura</Pill>
            </span>
          </figcaption>
        </figure>
      </div>
    </SlideFrame>
  );
}

/* 11 · Pasaba las 210 pruebas. */
export function TestsSlide() {
  return (
    <SlideFrame className="an-tests">
      <Eyebrow>Revisión · 0:45</Eyebrow>
      <h2 className="dd-heading">Pasaba las 210 pruebas. Igual se podía saltar la verificación en dos pasos.</h2>
      <div className="an-tests-row">
        <div className="an-dots" role="img" aria-label="210 pruebas en verde">
          {Array.from({ length: 210 }, (_, index) => <i key={index} />)}
          <span className="an-dots-count">210 / 210 en verde</span>
        </div>
        <div className="an-hole">
          <i className="an-hole-dot" aria-hidden="true" />
          <p>
            <strong>Fuera de las pruebas</strong>
            Saltar la verificación en dos pasos
          </p>
        </div>
      </div>
      <p className="an-caption">
        Una revisión con <CodexWordmark className="an-inline-codex" /> lo encontró antes de cerrar la corrección.
      </p>
    </SlideFrame>
  );
}

/* 12 · Un error se corrige. La regla queda escrita. */
export function MemorySlide() {
  return (
    <SlideFrame className="an-memory">
      <Eyebrow>Memoria · 1:00</Eyebrow>
      <h2 className="dd-heading">Un error se corrige.
        <br />
        La regla queda escrita.
      </h2>
      <div className="an-memory-row">
        <article className="an-incident">
          <span className="an-incident-tag">Incidente · 19 sep 2026</span>
          <p>Se publicó un cambio sin preparar la base de datos. Todas las páginas con sesión fallaron.</p>
        </article>
        <span className="an-arrow" aria-hidden="true">→</span>
        <div className="an-memory-paper">
          <Paper added="Primero se aplica el cambio en la base de datos; después se publica el código." />
          <span className="an-added-tag">Regla nueva · 19 sep 2026</span>
        </div>
      </div>
    </SlideFrame>
  );
}

/* 13 · Construido así. */
const products = [
  { name: "Autoshop", body: "De cero a demo guiada en un día", src: autoshopShot, focus: "right top" },
  { name: "Lima", body: "Plataforma de licencias en producción", src: limaShot, focus: "left top" },
  { name: "RoKa IS", body: "Sistema de gestión de importaciones", src: rokaShot, focus: "left top" },
];

export function ProductsSlide() {
  return (
    <SlideFrame className="an-products">
      <Eyebrow>Resultado · 1:15</Eyebrow>
      <h2 className="dd-heading">Construido así.</h2>
      <ul className="an-shots">
        {products.map((product) => (
          <li key={product.name}>
            <span className="an-shot" style={{ "--focus": product.focus } as CSSProperties}>
              <img src={product.src} alt={`Captura de ${product.name} con datos de prueba`} draggable={false} />
            </span>
            <strong>{product.name}</strong>
            <span>{product.body}</span>
          </li>
        ))}
      </ul>
    </SlideFrame>
  );
}

/* 14 · El lunes: elegí una tarea y delegala. */
export function MondaySlide() {
  return (
    <SlideFrame className="an-monday">
      <Topo className="an-topo--corner" />
      <Eyebrow>Para empezar · 1:15</Eyebrow>
      <h2 className="dd-heading">El lunes: elegí una tarea y delegala.</h2>
      <Steps
        items={[
          { title: "Escribí el contexto" },
          { title: "Escribí el brief: cuándo está listo" },
          { title: "Delegá" },
          { title: "Revisá y anotá lo aprendido" },
        ]}
      />
    </SlideFrame>
  );
}

/* 15 · Preguntas + QR. Same crowd and type as the kit's ClosingSlide, plus the contact QR. */
export function QuestionsSlide() {
  const info = useSlideInfo();
  const face: FaceConfig = info?.speaker ? { ...info.speaker.face, gaze: { x: -0.3, y: 0.35 } } : FACE_PRESETS.squeeze;
  return (
    <SlideFrame className="dd-closing an-closing" footer={false}>
      <Crowd faces={closingCrowd({ x: 32, y: 18 })} className="dd-closing-crowd" />
      <Eyebrow>{info?.deckTitle}</Eyebrow>
      <h1 className="dd-display">
        ¿Preguntas?
        <SlideFace face={face} size={9} className="dd-closing-face" />
      </h1>
      <p className="dd-lead">
        Gracias. La conversación sigue con <strong>{DEVDAY_EVENT.hashtag}</strong>.
      </p>
      <aside className="an-qr">
        <span className="an-qr-code">
          <img src={qrBorea} alt="Código QR a borealabs.com" draggable={false} />
        </span>
        <strong>Hablemos</strong>
        <span>borealabs.com</span>
      </aside>
    </SlideFrame>
  );
}

