import type { CSSProperties, ReactNode } from "react";
import { Face, Mark } from "../../devday/Face";
import { AiLabsLogo, CodexWordmark, OpenAIWordmark } from "../../devday/Brand";
import { FACE_PALETTE, type FaceConfig } from "../../devday/faces";
import { DEVDAY_EVENT } from "../../devday/event";
import { SlideFrame } from "../kit/layouts";
import "./decisions-api.css";

/*
 * Réplica del PPTX de Frank (16.67in × 9.375in) con el branding del kit:
 * Geist, tokens --slide-* (tema claro/oscuro), caras DevDay y footer del evento.
 * x/y: % del slide original → top = y·0.5625 cqw (alto = 56.25% del ancho).
 * sz: puntos → cqw (1 cqw = 12 pt en un slide de 1200 pt de ancho).
 */

const FG = "var(--slide-fg)";
const BG = "var(--slide-bg)";
const MU = "var(--slide-muted)";
const SF = "var(--slide-surface)";
const BD = "var(--slide-border)";
const BL = "var(--slide-blue)";
const PU = "var(--slide-purple)";
const GR = "var(--slide-green)";
const OR = "var(--slide-orange)";

/** Texto posicionado: x,y en % del slide original; sz en puntos. */
function E({
  x,
  y,
  w,
  sz,
  b,
  c = FG,
  children,
}: {
  x: number;
  y: number;
  w?: number;
  sz: number;
  b?: boolean;
  c?: string;
  children: ReactNode;
}) {
  return (
    <span
      className="fc-e"
      style={{
        left: `${x}cqw`,
        top: `${y * 0.5625}cqw`,
        ...(w ? { width: `${w}cqw` } : {}),
        fontSize: `${(sz / 12).toFixed(3)}cqw`,
        fontWeight: b ? 700 : 400,
        color: c,
      }}
    >
      {children}
    </span>
  );
}

/* Carita DevDay equivalente a los ojos del PPTX. */
const FACES = {
  curious: (color: string): FaceConfig => ({ color, expression: "curious" }),
  plus: (color: string): FaceConfig => ({ color, expression: "plus" }),
  squeeze: (color: string): FaceConfig => ({ color, expression: "squeeze" }),
  sleepy: (color: string): FaceConfig => ({ color, expression: "sleepy" }),
  spark: (color: string): FaceConfig => ({ color, expression: "spark" }),
  happy: (color: string): FaceConfig => ({ color, expression: "happy" }),
  wink: (color: string): FaceConfig => ({ color, expression: "wink" }),
};

/** Cara DevDay posicionada (d = diámetro en cqw). */
function KFace({ x, y, d, cfg }: { x: number; y: number; d: number; cfg: FaceConfig }) {
  return (
    <span
      className="fc-face"
      style={{ left: `${x}cqw`, top: `${y * 0.5625}cqw`, width: `${d}cqw`, height: `${d}cqw` }}
      aria-hidden="true"
    >
      <Face config={cfg} />
    </span>
  );
}

/** Signo "?" del PPTX → Mark del kit. */
function QMark({ x, y, d }: { x: number; y: number; d: number }) {
  return (
    <span
      className="fc-face"
      style={{ left: `${x}cqw`, top: `${y * 0.5625}cqw`, width: `${d}cqw`, height: `${d}cqw` }}
      aria-hidden="true"
    >
      <Mark kind="question" color={BL} />
    </span>
  );
}

/** Rectángulo posicionado (tarjetas, reglas y barras). */
function Box({
  x,
  y,
  w,
  h,
  bg,
  r,
  border,
  children,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  bg?: string;
  r?: number;
  border?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className="fc-box"
      style={{
        left: `${x}cqw`,
        top: `${y * 0.5625}cqw`,
        width: `${w}cqw`,
        height: `${h * 0.5625}cqw`,
        background: bg,
        borderRadius: r ? `${r}cqw` : undefined,
        border,
      }}
    >
      {children}
    </div>
  );
}

function P({ label, children }: { label: string; children: ReactNode }) {
  return (
    <SlideFrame className="fc-pptx" label={label}>
      {children}
    </SlideFrame>
  );
}

/* ---------- 01 · Portada ---------- */
export function AiCodingCoverSlide() {
  return (
    <P label="AI Coding: Generar código es fácil. Construir software es otra historia.">
      <div className="fc-top">
        <OpenAIWordmark className="fc-openai" />
        <span className="fc-rule" aria-hidden="true" />
        <span className="fc-event">
          {DEVDAY_EVENT.name} {DEVDAY_EVENT.city}
        </span>
      </div>
      <div className="fc-top fc-top--brands">
        <CodexWordmark className="fc-codex" />
        <span className="fc-rule" aria-hidden="true" />
        <span className="fc-organiza">Organiza</span>
        <AiLabsLogo className="fc-ailabs" />
      </div>
      <QMark x={75.74} y={18.2} d={4.0} />
      <KFace x={82.61} y={17.22} d={8.8} cfg={FACES.curious(FACE_PALETTE.purple)} />
      <KFace x={75.19} y={31.89} d={5.22} cfg={FACES.spark(FACE_PALETTE.gray)} />
      <KFace x={83.16} y={38.24} d={8.53} cfg={FACES.plus(FACE_PALETTE.green)} />
      <KFace x={76.29} y={49.49} d={18.7} cfg={FACES.squeeze(FACE_PALETTE.blue)} />
      <KFace x={69.69} y={58.78} d={9.62} cfg={FACES.sleepy(FACE_PALETTE.orange)} />
      <E x={5.25} y={24.0} sz={94.5} b>
        AI Coding:
      </E>
      <E x={5.25} y={40.22} sz={58.5} b>
        Generar código es fácil.
      </E>
      <E x={5.25} y={51.78} sz={58.5} b>
        Construir software es
      </E>
      <E x={5.25} y={63.33} sz={66} b c={BL}>
        otra historia.
      </E>
      <Box x={5.38} y={84.0} w={0.12} h={6.78} bg={BD} />
      <E x={7.25} y={83.33} sz={21.75} b>
        Frank Calderón
      </E>
      <E x={7.25} y={88.0} sz={18.75} c={MU}>
        Software Developer
      </E>
    </P>
  );
}

/* ---------- 02 · ¿La IA nos va a reemplazar? ---------- */
export function ReemplazarSlide() {
  return (
    <P label="¿La IA nos va a reemplazar?">
      <KFace x={81.56} y={27.22} d={12.81} cfg={FACES.sleepy(FACE_PALETTE.orange)} />
      <E x={5.25} y={30.56} sz={82.5} b>
        ¿La IA nos va
      </E>
      <E x={5.25} y={45.0} sz={82.5} b c={BL}>
        a reemplazar?
      </E>
      <E x={5.25} y={69.44} sz={36.75}>
        ¿O va a transformar la manera
      </E>
      <E x={5.25} y={76.89} sz={36.75}>
        en que trabajamos?
      </E>
    </P>
  );
}

/* ---------- 03 · La IA está transformando nuestras tareas ---------- */
export function TareasSlide() {
  const antes = [
    ["?", "Investigar"],
    ["</>", "Escribir código"],
    ["!", "Depurar"],
    ["≡", "Documentar"],
    ["▷", "Probar"],
  ];
  const ahora = [
    ["◎", "Definir"],
    ["◇", "Dirigir"],
    ["✦", "Construir"],
    ["✓", "Validar"],
    ["↑", "Mejorar"],
  ];
  const rows = [47.11, 54.0, 60.89, 67.78, 74.67];
  return (
    <P label="La IA está transformando nuestras tareas">
      <E x={5.25} y={32.33} sz={49.5} b>
        La IA está
      </E>
      <E x={5.25} y={42.0} sz={49.5} b>
        transformando
      </E>
      <E x={5.25} y={51.67} sz={49.5} b c={BL}>
        nuestras tareas
      </E>
      <E x={9.0} y={66.0} w={33.75} sz={22.5} c={MU}>
        No dejamos de programar.
        <br />
        Cambia cómo invertimos
        <br />
        nuestro tiempo.
      </E>
      <Box x={47.5} y={34.44} w={20} h={52.22} bg={FG} r={0.9} />
      <Box x={73.12} y={34.44} w={20.62} h={52.22} bg={SF} r={0.9} />
      <E x={50.12} y={38.0} sz={28.5} b c={BG}>
        Antes
      </E>
      <E x={75.75} y={38.0} sz={28.5} b>
        Ahora
      </E>
      {antes.map(([icon, text], i) => (
        <span key={text}>
          <E x={49.81} y={rows[i]} w={3.44} sz={22.5} c={BG}>
            {icon}
          </E>
          <E x={53.56} y={rows[i]} w={13.44} sz={20.25} c={BG}>
            {text}
          </E>
        </span>
      ))}
      {ahora.map(([icon, text], i) => (
        <span key={text}>
          <E x={75.0} y={rows[i]} w={3.44} sz={22.5}>
            {icon}
          </E>
          <E x={78.75} y={rows[i]} w={13.75} sz={20.25}>
            {text}
          </E>
        </span>
      ))}
      <E x={68.75} y={58.0} sz={35.25}>
        →
      </E>
      <KFace x={85.62} y={17.44} d={9.06} cfg={FACES.happy(FACE_PALETTE.purple)} />
      <KFace x={86.88} y={76.0} d={7.5} cfg={FACES.sleepy(FACE_PALETTE.orange)} />
      <KFace x={5.25} y={85.56} d={6.56} cfg={FACES.plus(FACE_PALETTE.green)} />
    </P>
  );
}

/* ---------- 04 · Escribir código ≠ desarrollar software ---------- */
export function CodigoVsSoftwareSlide() {
  return (
    <P label="Escribir código ≠ desarrollar software">
      <KFace x={82.81} y={21.56} d={10.31} cfg={FACES.wink(FACE_PALETTE.orange)} />
      <E x={5.25} y={21.44} sz={58.5} b>
        Escribir código
      </E>
      <E x={5.25} y={33.89} sz={46.5} c={MU}>
        ≠
      </E>
      <Box x={5.25} y={46.67} w={89.38} h={0.33} bg={BD} />
      <E x={5.25} y={52.0} sz={58.5} b c={BL}>
        Desarrollar software
      </E>
      <E x={5.25} y={69.56} sz={30}>
        El código es el medio.
      </E>
      <E x={51.25} y={69.56} sz={30}>
        La solución es el objetivo.
      </E>
    </P>
  );
}

/* ---------- 05 · La responsabilidad sigue siendo nuestra ---------- */
export function ResponsabilidadSlide() {
  return (
    <P label="La responsabilidad sigue siendo nuestra">
      <E x={5.25} y={25.44} sz={69} b>
        La IA puede
      </E>
      <E x={5.25} y={37.78} sz={69} b>
        escribir código.
      </E>
      <E x={5.25} y={54.56} sz={54} b>
        Pero construir buen software
      </E>
      <E x={5.25} y={65.78} sz={54} b>
        sigue siendo
      </E>
      <E x={5.25} y={77.0} sz={63.75} b c={BL}>
        nuestra responsabilidad.
      </E>
    </P>
  );
}

/* ---------- 06 · 5 prácticas para desarrollar mejor con Codex ---------- */
export function CincoPracticasSlide() {
  const items: [string, string, string][] = [
    ["01", "Instrucciones", PU],
    ["02", "Contexto", BL],
    ["03", "Herramientas", OR],
    ["04", "Especificaciones", GR],
    ["05", "Validación", FG],
  ];
  const rows = [57.11, 62.78, 68.44, 74.11, 79.78];
  return (
    <P label="5 prácticas para desarrollar mejor con Codex">
      <QMark x={76.12} y={22.56} d={3.8} />
      <KFace x={82.38} y={21.67} d={8.0} cfg={FACES.curious(FACE_PALETTE.purple)} />
      <KFace x={75.62} y={35.0} d={4.75} cfg={FACES.spark(FACE_PALETTE.gray)} />
      <KFace x={82.88} y={40.78} d={7.75} cfg={FACES.plus(FACE_PALETTE.green)} />
      <KFace x={76.62} y={51.0} d={17.0} cfg={FACES.squeeze(FACE_PALETTE.blue)} />
      <KFace x={70.62} y={59.44} d={8.75} cfg={FACES.sleepy(FACE_PALETTE.orange)} />
      <E x={5.25} y={21.56} sz={61.5} b>
        5 prácticas para
      </E>
      <E x={5.25} y={32.33} sz={61.5} b>
        desarrollar mejor
      </E>
      <E x={5.25} y={43.11} sz={61.5} b c={BL}>
        con Codex
      </E>
      {items.map(([num, text, color], i) => (
        <span key={num}>
          <E x={5.62} y={rows[i]} w={5.62} sz={21} b c={color}>
            {num}
          </E>
          <E x={12.19} y={rows[i]} sz={24.75} b>
            {text}
          </E>
        </span>
      ))}
      <Box x={5.25} y={86.5} w={90.62} h={4.78} border={`0.08cqw solid ${FG}`}>
        <span className="fc-bar-text" style={{ fontSize: `${(21 / 12).toFixed(3)}cqw` }}>
          No se trata de escribir mejores prompts. Se trata de trabajar mejor.
        </span>
      </Box>
    </P>
  );
}

/* ---------- Molde de práctica: NN / 05 + título + bajada ---------- */
function PracticeHead({
  n,
  title,
  lede,
  kickerColor,
}: {
  n: string;
  title: string;
  lede: string;
  kickerColor?: string;
}) {
  return (
    <>
      <E x={5.25} y={18.44} sz={17.25} b c={kickerColor ?? MU}>
        {n} / 05
      </E>
      <E x={5.25} y={24.89} sz={57} b>
        {title}
      </E>
      <E x={5.25} y={37.33} sz={24} c={MU}>
        {lede}
      </E>
    </>
  );
}

/* ---------- 07 · Instrucciones ---------- */
export function InstruccionesSlide() {
  return (
    <P label="Instrucciones">
      <PracticeHead n="01" title="Instrucciones" lede="Define cómo debe trabajar tu agente." />
      <Box x={5.25} y={49.11} w={68.12} h={31.11} bg={SF} r={0.9} />
      <E x={7.38} y={50.78} sz={28.5} b>
        AGENTS.md
      </E>
      <E x={7.38} y={58.11} w={63.12} sz={23.25}>
        Convenciones
        <br />
        Arquitectura
        <br />
        Estándares
        <br />
        Reglas del proyecto
      </E>
      <KFace x={79.38} y={52.44} d={13.75} cfg={FACES.curious(FACE_PALETTE.purple)} />
      <E x={5.25} y={84.0} sz={26.25} b>
        No hagas que tu agente adivine cómo trabajas.
      </E>
    </P>
  );
}

/* ---------- 08 · Contexto ---------- */
export function ContextoSlide() {
  return (
    <P label="Contexto">
      <PracticeHead n="02" title="Contexto" lede="La IA necesita conocer tu proyecto." />
      <E x={5.25} y={51.67} w={40.62} sz={38.25} b>
        Documentación
        <br />
        Requerimientos
      </E>
      <E x={50.25} y={51.67} w={43.75} sz={38.25} b c={BL}>
        Arquitectura
        <br />
        Reglas de negocio
      </E>
      <Box x={5.25} y={80.22} w={88.75} h={0.33} bg={BD} />
      <E x={5.25} y={82.5} sz={23.25} b>
        El problema no siempre es que la IA no sepa programar.
        <br />
        A veces no conoce nuestro proyecto.
      </E>
    </P>
  );
}

/* ---------- 09 · Herramientas ---------- */
export function HerramientasSlide() {
  const cols = [
    { cfg: FACES.squeeze(FACE_PALETTE.blue), x: 8.06, label: "Codex", lx: 5.25 },
    { cfg: FACES.curious(FACE_PALETTE.purple), x: 40.31, label: "MCP", lx: 37.5 },
    { cfg: FACES.sleepy(FACE_PALETTE.orange), x: 72.56, label: "Integraciones", lx: 69.75 },
  ];
  return (
    <P label="Herramientas">
      <PracticeHead
        n="03"
        title="Herramientas"
        lede="Dale a tu agente las herramientas correctas."
        kickerColor={OR}
      />
      {cols.map(({ cfg, x, label, lx }) => (
        <span key={label}>
          <KFace x={x} y={49.22} d={9.38} cfg={cfg} />
          <E x={lx} y={68.11} sz={27} b>
            {label}
          </E>
        </span>
      ))}
      <E x={5.25} y={77.56} w={45.31} sz={23.25}>
        Repositorios y documentación
      </E>
      <E x={50.25} y={77.56} w={45.31} sz={23.25}>
        Servicios y herramientas de desarrollo
      </E>
      <E x={5.25} y={84.0} sz={22.5}>
        Un agente es más útil cuando puede actuar
        <br />
        con el contexto y los permisos adecuados.
      </E>
    </P>
  );
}

/* ---------- 10 · Especificaciones ---------- */
export function EspecificacionesSlide() {
  const items = ["Problema", "Requerimientos", "Plan", "Implementación"];
  const rows = [50.11, 57.44, 64.78, 72.11];
  return (
    <P label="Especificaciones">
      <PracticeHead n="04" title="Especificaciones" lede="Primero define. Después construye." />
      <E x={5.25} y={52.11} sz={41.25} b>
        Spec-Driven
        <br />
        Development
      </E>
      {items.map((text, i) => (
        <span key={text}>
          <span
            className="fc-face"
            style={{
              left: "54.06cqw",
              top: `${(rows[i] + 1.78) * 0.5625}cqw`,
              width: "1.38cqw",
              height: "1.38cqw",
              borderRadius: "50%",
              background: GR,
            }}
            aria-hidden="true"
          />
          <E x={57.0} y={rows[i]} sz={26.25}>
            {text}
          </E>
        </span>
      ))}
      <E x={5.25} y={83.0} sz={24} b>
        La calidad de una solución comienza con la claridad del problema.
      </E>
    </P>
  );
}

/* ---------- 11 · Validación ---------- */
export function ValidacionSlide() {
  return (
    <P label="Validación">
      <PracticeHead
        n="05"
        title="Validación"
        lede="Confía en el proceso. Verifica el resultado."
        kickerColor={BL}
      />
      <E x={5.25} y={51.44} w={40.62} sz={44.25} b>
        Code review
        <br />
        Testing
      </E>
      <E x={50.25} y={51.44} w={45} sz={39} b c={BL}>
        Seguridad
        <br />
        Criterios de aceptación
      </E>
      <E x={5.25} y={81.0} sz={31.5} b>
        Delegar la implementación no significa
        <br />
        delegar la responsabilidad.
      </E>
    </P>
  );
}

/* ---------- 12 · Cierre ---------- */
export function CierreSlide() {
  return (
    <P label="El futuro: construir mejores soluciones">
      <QMark x={75.67} y={18.74} d={4.0} />
      <KFace x={82.47} y={17.78} d={8.7} cfg={FACES.curious(FACE_PALETTE.purple)} />
      <KFace x={75.12} y={32.28} d={5.17} cfg={FACES.spark(FACE_PALETTE.gray)} />
      <KFace x={83.01} y={38.56} d={8.43} cfg={FACES.plus(FACE_PALETTE.green)} />
      <KFace x={76.21} y={49.68} d={18.49} cfg={FACES.squeeze(FACE_PALETTE.blue)} />
      <KFace x={69.69} y={58.86} d={9.52} cfg={FACES.sleepy(FACE_PALETTE.orange)} />
      <E x={5.25} y={24.22} sz={57.75} b>
        El futuro no se trata
      </E>
      <E x={5.25} y={34.44} sz={57.75} b>
        de escribir más código.
      </E>
      <E x={5.25} y={48.33} sz={51} b c={BL}>
        Se trata de construir
      </E>
      <E x={5.25} y={58.11} sz={51} b c={BL}>
        mejores soluciones.
      </E>
      <E x={5.25} y={74.33} sz={27.75} b>
        Aprender&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;Construir&nbsp;&nbsp;&nbsp;→&nbsp;&nbsp;&nbsp;Compartir
      </E>
      <Box x={5.38} y={84.0} w={0.12} h={6.78} bg={BD} />
      <E x={7.25} y={83.33} sz={21.75} b>
        Frank Calderón
      </E>
      <E x={7.25} y={88.0} sz={18.75} c={MU}>
        frankcalderon.dev&nbsp;&nbsp;@frankcalderondev
      </E>
    </P>
  );
}
