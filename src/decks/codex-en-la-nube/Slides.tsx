import type { CSSProperties, ReactNode } from "react";
import { Face } from "../../devday/Face";
import { CodexWordmark } from "../../devday/Brand";
import { FACE_PALETTE, FACE_PRESETS, type FaceConfig } from "../../devday/faces";
import { speakers } from "../../devday/speakers";
import { Eyebrow, Pill, SlideFace, SlideFrame } from "../kit/layouts";
import "./codex-en-la-nube.css";

const { blue, green, orange, purple } = FACE_PALETTE;

/* The talk's cast. Walter keeps his own face; Codex and each task get theirs. */
const cast = {
  codex: { ...FACE_PRESETS.plus, color: blue, gaze: { x: 0, y: 0.1 } } as FaceConfig,
  investigar: { ...FACE_PRESETS.curious, color: orange, gaze: { x: 0.3, y: 0.2 } } as FaceConfig,
  crear: { ...FACE_PRESETS.happy, color: green, rotation: -6, gaze: { x: 0.1, y: 0.2 } } as FaceConfig,
  revisar: { ...FACE_PRESETS.squeeze, color: purple, gaze: { x: -0.2, y: 0.1 } } as FaceConfig,
  dots: { ...FACE_PRESETS.spark, color: orange, gaze: { x: 0.4, y: 0.1 } } as FaceConfig,
  vos: speakers.walter.face,
};

/* The example that runs through the whole talk. Invented: marked «Ejemplo» on screen. */
const evento = {
  nombre: "Mercadito del Sábado",
  fecha: "Sábado 8 de noviembre",
  hora: "9:00 a 14:00",
  lugar: "Parque central de la colonia",
  puestos: ["Pan y café", "Plantas", "Artesanías", "Ropa usada"],
};

function Example({ children = "Ejemplo" }: { children?: ReactNode }) {
  return <span className="cn-example">{children}</span>;
}

function Char({ face, name, size, className = "", style }: { face: FaceConfig; name?: string; size: number; className?: string; style?: CSSProperties }) {
  return (
    <figure className={`cn-char ${className}`} style={{ "--size": `${size}cqw`, ...style } as CSSProperties}>
      <span className="cn-char-face" aria-hidden="true">
        <Face config={face} />
      </span>
      {name && <figcaption>{name}</figcaption>}
    </figure>
  );
}

/** A browser window around a recreated page. */
function Browser({ url, children, className = "" }: { url: string; children: ReactNode; className?: string }) {
  return (
    <div className={`cn-browser ${className}`} aria-hidden="true">
      <div className="cn-browser-bar">
        <i />
        <i />
        <i />
        <span>{url}</span>
      </div>
      <div className="cn-browser-body">{children}</div>
    </div>
  );
}

/** The example event page. `fixed` shows it after the correction: the date goes on top. */
function EventPage({ fixed = false, compact = false }: { fixed?: boolean; compact?: boolean }) {
  return (
    <div className={`cn-page ${fixed ? "is-fixed" : ""} ${compact ? "is-compact" : ""}`}>
      {fixed && <span className="cn-page-date">{evento.fecha} · {evento.hora}</span>}
      <strong className="cn-page-title">{evento.nombre}</strong>
      <span className="cn-page-lead">Comida, plantas y artesanías de tus vecinos.</span>
      {!fixed && <span className="cn-page-small">{evento.fecha} · {evento.hora} · {evento.lugar}</span>}
      <span className="cn-page-stalls">
        {evento.puestos.map((puesto) => (
          <b key={puesto}>{puesto}</b>
        ))}
      </span>
      <span className="cn-page-actions">
        <b>Quiero un puesto</b>
        <i>Cómo llegar</i>
      </span>
    </div>
  );
}

/* 03 · ¿Qué podés crear con Codex? */
export function QueCrearSlide() {
  return (
    <SlideFrame className="cn-scene cn-crear">
      <Eyebrow>Contexto · 1:00</Eyebrow>
      <h2 className="dd-heading">¿Qué podés crear con Codex?</h2>
      <p className="dd-lead cn-crear-lead">
        Codex es un <strong>agente</strong>: un asistente que puede usar herramientas. Lee y escribe archivos, prueba lo que hizo y te entrega algo que podés abrir.
      </p>
      <div className="cn-stage cn-crear-stage">
        <div className="cn-outcome">
          <div className="cn-outcome-view">
            <Browser url="mercadito.page">
              <EventPage compact />
            </Browser>
          </div>
          <strong>Una página</strong>
          <span>Para tu evento, tu negocio o tu portafolio.</span>
        </div>
        <div className="cn-outcome">
          <div className="cn-outcome-view">
            <div className="cn-tool" aria-hidden="true">
              <span className="cn-tool-title">Cotizador de puestos</span>
              <span className="cn-tool-row"><em>Mesas</em><b>2</b></span>
              <span className="cn-tool-row"><em>Toldo</em><b>Sí</b></span>
              <span className="cn-tool-row"><em>Electricidad</em><b>No</b></span>
              <span className="cn-tool-total"><em>Total</em><b>$18</b></span>
            </div>
          </div>
          <strong>Una herramienta</strong>
          <span>Algo que te ahorra una tarea repetida en el trabajo.</span>
        </div>
        <div className="cn-outcome">
          <div className="cn-outcome-view cn-outcome-view--change">
            <span className="cn-before" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="cn-arrow" aria-hidden="true" />
            <span className="cn-after" aria-hidden="true">
              <b />
              <i />
              <i />
            </span>
          </div>
          <strong>Una mejora</strong>
          <span>A algo que ya existe: más claro, más rápido, sin un error.</span>
        </div>
        <SlideFace face={{ ...cast.codex, gaze: { x: -0.6, y: 0.3 } }} size={8.5} className="cn-crear-face" />
        <Example />
      </div>
    </SlideFrame>
  );
}

/* 04 · Una idea necesita contexto */
export function ContextoSlide() {
  const parts = [
    { label: "Para quién", color: blue, text: "Vecinos de la colonia que nunca vinieron al mercadito." },
    { label: "Qué resuelve", color: green, text: "Hoy la info está en un chat: fecha, lugar y cómo pedir un puesto." },
    { label: "Cómo se ve bien", color: orange, text: "Se lee bien en el celular. La fecha se entiende en tres segundos." },
    { label: "Material", color: purple, text: "Fotos del mes pasado y la lista de puestos." },
  ];
  return (
    <SlideFrame className="cn-scene cn-contexto">
      <Eyebrow>Práctica · 1:00</Eyebrow>
      <h2 className="dd-heading">Una idea necesita contexto.</h2>
      <div className="cn-stage cn-contexto-stage">
        <div className="cn-vague">
          <span className="cn-prompt cn-prompt--vague">Haceme una página para un evento.</span>
          <Char face={{ ...cast.codex, expression: "curious", gaze: { x: -0.4, y: -0.5 } }} size={7.5} className="cn-vague-face" />
          <span className="cn-vague-q">¿Qué evento? ¿Para quién? ¿Qué tiene que lograr?</span>
        </div>
        <div className="cn-brief" aria-label="Un encargo con contexto">
          <span className="cn-brief-head">
            <CodexWordmark className="cn-brief-codex" />
            <em>Encargo</em>
          </span>
          <p className="cn-brief-goal">Una página para el {evento.nombre}.</p>
          <ul>
            {parts.map((part) => (
              <li key={part.label} style={{ "--part": part.color } as CSSProperties}>
                <span>{part.label}</span>
                {part.text}
              </li>
            ))}
          </ul>
          <Example />
        </div>
      </div>
    </SlideFrame>
  );
}

/* 05 · Repartí el trabajo */
export function RepartirSlide() {
  const tasks = [
    { face: cast.investigar, title: "Investigar", body: "Mirá tres páginas de mercados locales y anotá qué datos ponen primero.", result: "Lista de ideas" },
    { face: cast.crear, title: "Crear", body: "Armá la página con el encargo y las fotos.", result: "La página" },
    { face: cast.revisar, title: "Revisar", body: "Abrila en un celular y anotá lo que no se entiende.", result: "Lista de arreglos" },
  ];
  return (
    <SlideFrame className="cn-scene cn-repartir">
      <Eyebrow>Concepto · 1:30</Eyebrow>
      <h2 className="dd-heading">Repartí el trabajo.</h2>
      <p className="dd-lead">Cada tarea es un encargo chico. Las que no dependen entre sí avanzan al mismo tiempo.</p>
      <div className="cn-stage cn-repartir-stage">
        <div className="cn-flow-start">
          <span className="cn-flow-chip">El encargo</span>
        </div>
        <ol className="cn-lanes">
          {tasks.map((task) => (
            <li key={task.title}>
              <span className="cn-lane-face" aria-hidden="true">
                <Face config={task.face} />
              </span>
              <strong>{task.title}</strong>
              <p>{task.body}</p>
              <span className="cn-lane-result" style={{ "--lane": task.face.color } as CSSProperties}>{task.result}</span>
            </li>
          ))}
        </ol>
        <div className="cn-flow-end">
          <span className="cn-flow-end-face" aria-hidden="true">
            <Face config={{ ...cast.vos, gaze: { x: -0.5, y: 0 } }} />
          </span>
          <strong>Vos reunís</strong>
          <span>y comprobás que todo encaje.</span>
        </div>
        <svg className="cn-flow-lines" viewBox="0 0 100 30" preserveAspectRatio="none" aria-hidden="true">
          <path d="M11 15 C 16 15, 16 4, 22 4 M11 15 L 22 15 M11 15 C 16 15, 16 26, 22 26" />
          <path d="M77 4 C 83 4, 83 15, 88 15 M77 15 L 88 15 M77 26 C 83 26, 83 15, 88 15" />
        </svg>
      </div>
    </SlideFrame>
  );
}

/* 06 · Dots */
export function DotsSlide() {
  const avisos = [
    { when: "Lunes · 9:10", body: "Llegaron tres puestos nuevos. Los sumé a la lista." },
    { when: "Miércoles · 16:40", body: "La página ya muestra los siete puestos.", review: true },
    { when: "Viernes · 8:00", body: "Todo en orden. Nada para revisar." },
  ];
  return (
    <SlideFrame className="cn-scene cn-dots">
      <Eyebrow>DevDay · 0:30</Eyebrow>
      <h2 className="dd-heading">Dots: delegá una responsabilidad.</h2>
      <p className="dd-lead">
        Una tarea termina cuando se entrega. Una <strong>responsabilidad</strong> sigue: un agente siempre activo la atiende, trabaja con Codex cuando hay que cambiar algo y te avisa.
      </p>
      <div className="cn-stage cn-dots-stage">
        <div className="cn-dots-brief">
          <span className="cn-dots-face" aria-hidden="true">
            <Face config={cast.dots} />
          </span>
          <span className="cn-recipe-label">Le encargás</span>
          <p>Seguí las inscripciones de puestos del Mercadito. Si cambia algo, actualizá la página y avisame.</p>
        </div>
        <ol className="cn-dots-feed">
          {avisos.map((aviso) => (
            <li key={aviso.when} className={aviso.review ? "is-review" : ""}>
              <span className="cn-dots-when">{aviso.when}</span>
              <strong>{aviso.body}</strong>
              {aviso.review && <Pill color={purple}>Propuesta de cambio para revisar</Pill>}
            </li>
          ))}
        </ol>
        <Example />
      </div>
    </SlideFrame>
  );
}

/* 07 · Probalo antes de darlo por terminado */
export function ProbarSlide() {
  const checks = [
    { title: "¿Se abre en el celular?", body: "Ahí la va a ver casi todo el mundo." },
    { title: "¿Los botones llevan a donde dicen?", body: "Tocá cada uno: «Quiero un puesto», «Cómo llegar»." },
    { title: "¿Cumple el encargo?", body: "Volvé a leer «cómo se ve bien» y compará." },
    { title: "¿Qué cambió?", body: "Codex te deja una propuesta de cambio (PR) para revisar antes de aceptarla." },
  ];
  return (
    <SlideFrame className="cn-scene cn-probar">
      <Eyebrow>Práctica · 1:30</Eyebrow>
      <h2 className="dd-heading">Probalo antes de darlo por terminado.</h2>
      <div className="cn-stage cn-probar-stage">
        <div className="cn-phone" aria-hidden="true">
          <span className="cn-phone-notch" />
          <EventPage fixed compact />
          <span className="cn-pin cn-pin--1">1</span>
          <span className="cn-pin cn-pin--2">2</span>
          <span className="cn-pin cn-pin--3">3</span>
        </div>
        <ol className="cn-checks">
          {checks.map((check) => (
            <li key={check.title}>
              <strong>{check.title}</strong>
              <span>{check.body}</span>
            </li>
          ))}
        </ol>
        <p className="cn-note cn-probar-note">
          <Pill color={purple}>DevDay · Revisión de cambios</Pill>
          <span>Codex también puede revisar un cambio. La decisión de aceptarlo sigue siendo tuya.</span>
        </p>
      </div>
    </SlideFrame>
  );
}

/* 08 · Elegí tu primer proyecto */
export function PrimerProyectoSlide() {
  return (
    <SlideFrame className="cn-scene cn-primero">
      <Eyebrow>Cierre · 2:00</Eyebrow>
      <h2 className="dd-heading">Elegí tu primer proyecto.</h2>
      <p className="dd-lead">Algo pequeño, que te sirva esta semana y que puedas comprobar vos.</p>
      <div className="cn-stage cn-primero-stage">
        <div className="cn-recipe">
          <span className="cn-recipe-label">Tu primer encargo</span>
          <p>
            Quiero <u style={{ "--part": blue } as CSSProperties}>una página para…</u>
            <br />
            para <u style={{ "--part": green } as CSSProperties}>quién la va a usar</u>.
            <br />
            Queda bien si <u style={{ "--part": orange } as CSSProperties}>lo que vas a comprobar</u>.
          </p>
          <span className="cn-recipe-parts">
            <b style={{ "--part": blue } as CSSProperties}>Objetivo</b>
            <b style={{ "--part": green } as CSSProperties}>Contexto</b>
            <b style={{ "--part": orange } as CSSProperties}>Cómo saber si quedó bien</b>
          </span>
        </div>
        <div className="cn-where">
          <div className="cn-where-card">
            <strong>En tu computadora</strong>
            <span>Trabaja en tus archivos mientras la sesión está abierta. Lo ves paso a paso.</span>
          </div>
          <div className="cn-where-card cn-where-card--cloud">
            <strong>En la nube</strong>
            <span>Trabaja en una copia del proyecto en servidores de OpenAI. Volvés y revisás el resultado.</span>
          </div>
          <span className="cn-where-hint">Empezá por el que puedas supervisar.</span>
        </div>
        <SlideFace face={{ ...cast.vos, gaze: { x: -0.5, y: -0.4 } }} size={9} className="cn-primero-face" />
        <SlideFace face={{ ...cast.codex, gaze: { x: -0.7, y: -0.2 } }} size={5.5} className="cn-primero-codex" />
      </div>
    </SlideFrame>
  );
}
