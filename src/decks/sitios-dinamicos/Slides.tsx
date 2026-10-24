import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { QRCodeSVG } from "qrcode.react";
import { AiLabsLogo, CodexWordmark } from "../../devday/Brand";
import { DEVDAY_EVENT } from "../../devday/event";
import { Mark } from "../../devday/Face";
import { FACE_PALETTE } from "../../devday/faces";
import { speakers } from "../../devday/speakers";
import { Eyebrow, Pill, SlideFace, SlideFrame } from "../kit/layouts";
import "./sitios.css";

const { blue, green, orange, purple, charcoal } = FACE_PALETTE;
const A = "/talks/sitios-dinamicos";
const SITIO = "https://rancho-varadero.vercel.app";
const GUIA = "https://github.com/saulcalderon/rancho-varadero/blob/main/GUIA.md";
const LINKEDIN = "https://www.linkedin.com/in/saul-calderon/";
const WEB = "https://saulcalderon.com";

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */

/** A real screenshot inside a minimal browser window. */
function Shot({ src, url, alt, className = "", style }: { src: string; url?: string; alt: string; className?: string; style?: CSSProperties }) {
  return (
    <figure className={`sd-shot ${className}`} style={style}>
      <div className="sd-shot-bar" aria-hidden="true">
        <i />
        <i />
        <i />
        {url && <span className="sd-shot-url">{url}</span>}
      </div>
      <img src={src} alt={alt} draggable={false} />
    </figure>
  );
}

/** A prompt exactly as you would paste it into Codex. */
function Prompt({ tag = "Prompt para Codex", children, className = "" }: { tag?: string; children: ReactNode; className?: string }) {
  return (
    <div className={`sd-prompt ${className}`}>
      <span className="sd-prompt-tag">{tag}</span>
      <p>{children}</p>
    </div>
  );
}

function Code({ children }: { children: ReactNode }) {
  return <code className="sd-code">{children}</code>;
}

/** Plays only on the live stage while motion runs; thumbnails keep the poster. */
function StageVideo({ src, poster, label, className = "" }: { src: string; poster: string; label: string; className?: string }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [onStage, setOnStage] = useState(false);
  const [running, setRunning] = useState(false);
  useEffect(() => {
    const video = ref.current;
    const stage = video?.closest<HTMLElement>("[data-motion-enabled]");
    if (!video || !stage) return;
    setOnStage(true);
    video.src = src;
    const sync = () => {
      const isRunning = stage.dataset.motionState === "running";
      setRunning(isRunning);
      if (isRunning) void video.play().catch(() => setRunning(false));
      else video.pause();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(stage, { attributes: true, attributeFilter: ["data-motion-state"] });
    return () => observer.disconnect();
  }, [src]);
  return (
    <video
      ref={ref}
      className={`sd-video ${className}`}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      controls={onStage && !running}
      aria-label={label}
    />
  );
}

/* ------------------------------------------------------------------ */
/* 03 · Antes y después                                                */
/* ------------------------------------------------------------------ */

export function AntesDespuesSlide() {
  return (
    <SlideFrame className="sd-antes">
      <Eyebrow>Contexto · 1:00</Eyebrow>
      <h2 className="dd-heading">De esto… a esto.</h2>
      <div className="sd-antes-pair">
        <div className="sd-antes-item sd-antes-item--antes">
          <Shot src={`${A}/sitio-antes.jpg`} url="rancho-varadero.vercel.app/antes" alt="El sitio básico de Rancho Varadero: plantilla genérica con barra oscura, foto de portada y botones azules" />
          <p>
            <b>Antes</b> Una plantilla genérica con las fotos tal cual.
          </p>
        </div>
        <span className="sd-antes-arrow" aria-hidden="true" />
        <div className="sd-antes-item">
          <Shot src={`${A}/sitio-despues.jpg`} url="rancho-varadero.vercel.app" alt="El sitio nuevo: la piscina a pantalla completa, el titular en blanco y el riel del recorrido a la derecha" />
          <p>
            <b>Después</b> Un recorrido por el rancho que avanza con el scroll.
          </p>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 04 · Qué es                                                         */
/* ------------------------------------------------------------------ */

const paradas = ["Piscina", "Kiosko", "Sala", "Corredor", "Mar", "Playa", "Aérea"];

export function QueEsSlide() {
  return (
    <SlideFrame className="sd-quees">
      <Eyebrow>Concepto · 1:00</Eyebrow>
      <h2 className="dd-heading">El scroll no reproduce el video: lo mueve.</h2>
      <p className="dd-lead">
        <strong>7 fotos</strong> son las tomas sin movimiento. <strong>6 clips</strong> generados con IA las unen. Cada clip empieza justo donde termina el anterior.
      </p>
      <div className="sd-tira" aria-label="Las 7 tomas sin movimiento del recorrido unidas por 6 clips">
        {paradas.map((nombre, i) => (
          <div key={nombre} className="sd-tira-item">
            <figure className="sd-tira-foto">
              <img src={`${A}/parada-${i + 1}.webp`} alt={`Toma ${i + 1}: ${nombre}`} draggable={false} />
              <figcaption>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {nombre}
              </figcaption>
            </figure>
            {i < paradas.length - 1 && (
              <span className="sd-tira-clip" aria-label={`clip ${i + 1}`}>
                <b>{i + 1}</b>
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="sd-scrub" aria-hidden="true">
        <span className="sd-scrub-label">scroll ↓</span>
        <span className="sd-scrub-track">
          <i />
        </span>
        <span className="sd-scrub-label">el video avanza →</span>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 05 · Lo que necesitás                                               */
/* ------------------------------------------------------------------ */

export function NecesitasSlide() {
  const items = [
    { tag: "El agente", title: "Codex", body: "Con Sol o Astra en esfuerzo alto. Escribe el código y usa las herramientas.", color: green, wordmark: true },
    { tag: "Imagen y video", title: "Higgsfield", body: "Decenas de modelos en un solo lugar, conectados a Codex por MCP.", color: purple },
    { tag: "Dos skills", title: "landing-page-design + scroll-world", body: "Instrucciones empaquetadas: cómo diseñar la página y cómo armar el recorrido.", color: orange },
    { tag: "La materia prima", title: "5–8 fotos reales", body: "Del lugar o del objeto, con buena luz. Son las tomas sin movimiento del recorrido.", color: blue },
  ];
  return (
    <SlideFrame className="sd-necesitas">
      <Eyebrow>Preparación · 0:30</Eyebrow>
      <h2 className="dd-heading">Lo que necesitás.</h2>
      <div className="sd-kit">
        {items.map((item) => (
          <article key={item.title} className="sd-kit-card" style={{ "--kit": item.color } as CSSProperties}>
            <span className="sd-kit-tag">{item.tag}</span>
            <h3>{item.wordmark ? <CodexWordmark className="sd-kit-codex" /> : item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
      <p className="sd-glosario">
        <b>Skill:</b> un paquete de instrucciones que el agente sigue para una tarea. <b>MCP:</b> un puente entre el agente y otra herramienta.
      </p>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 06 · Paso 1 · Conectar                                              */
/* ------------------------------------------------------------------ */

export function ConectarSlide() {
  return (
    <SlideFrame className="sd-paso sd-conectar">
      <div className="sd-paso-text">
        <Eyebrow>Paso 1 de 5 · 1:00</Eyebrow>
        <h2 className="dd-heading">Conectá Higgsfield con Codex.</h2>
        <ol className="sd-lista">
          <li>
            <b>1</b>
            <span>
              En higgsfield.ai → <b>MCP</b>, copiá el servidor: <Code>mcp.higgsfield.ai/mcp</Code>
            </span>
          </li>
          <li>
            <b>2</b>
            <span>Agregalo como servidor MCP en Codex e iniciá sesión con tu cuenta.</span>
          </li>
          <li>
            <b>3</b>
            <span>
              Instalá las skills: <Code>npx skills add oso95/scroll-world -a codex</Code> y pegá <Code>landing-page-design</Code> en{" "}
              <Code>AGENTS.md</Code>.
            </span>
          </li>
        </ol>
        <p className="sd-nota">
          También funciona con la CLI: <Code>npm i -g @higgsfield/cli</Code> · <Code>higgsfield auth login</Code>
        </p>
      </div>
      <div className="sd-conectar-shots">
        <Shot src={`${A}/hf-mcp.jpg`} url="higgsfield.ai/mcp" alt="Página MCP de Higgsfield: generar imágenes y videos en ChatGPT, con la dirección mcp.higgsfield.ai/mcp" className="sd-conectar-mcp" />
        <Shot src={`${A}/hf-conectar.jpg`} alt="Los tres pasos de Higgsfield para conectarse: abrir plugins, instalar e iniciar sesión, mencionar @Higgsfield" className="sd-conectar-pasos" />
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 07 · Paso 2 · Keyframes                                             */
/* ------------------------------------------------------------------ */

export function KeyframesSlide() {
  const pasos = ["Elegí y ordená", "Todo a 16:9", "Upscale", "Retoque con un solo prompt"];
  return (
    <SlideFrame className="sd-paso sd-keyframes">
      <div className="sd-paso-text">
        <Eyebrow>Paso 2 de 5 · 1:00</Eyebrow>
        <h2 className="dd-heading">De fotos a keyframes.</h2>
        <ol className="sd-chips">
          {pasos.map((paso, i) => (
            <li key={paso}>
              <b>{i + 1}</b>
              {paso}
            </li>
          ))}
        </ol>
        <Prompt tag="Prompt de retoque · GPT Image 2.5" className="sd-keyframes-prompt">
          Professional real-estate photo retouch of this exact photo. Keep the exact composition… Bright, clear, well-lit natural daylight: not washed
          out, not pale or hazy, and not oversaturated.
        </Prompt>
      </div>
      <div className="sd-compara">
        <figure>
          <img src={`${A}/aereo-antes.jpg`} alt="Toma aérea original: pálida y con bruma" draggable={false} />
          <figcaption>Original: pálida, con bruma</figcaption>
        </figure>
        <figure>
          <img src={`${A}/aereo-despues.jpg`} alt="La misma toma retocada: luz clara, colores naturales" draggable={false} />
          <figcaption>Retocada: misma foto, mejor luz</figcaption>
        </figure>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 08 · Paso 3 · Costo y prueba                                        */
/* ------------------------------------------------------------------ */

const modelos = [
  { nombre: "Kling 4.0", nota: "Atraviesa una palmera", creditos: "16" },
  { nombre: "Kling 3.0 pro", nota: "Arranca lento", creditos: "14" },
  { nombre: "MiniMax H3", nota: "El más suave · 2K", creditos: "16", gana: true },
  { nombre: "Seedance 2.5", nota: "Cinemático, 8× el precio", creditos: "128" },
];

export function CostoSlide() {
  return (
    <SlideFrame className="sd-paso sd-costo">
      <div className="sd-paso-text">
        <Eyebrow>Paso 3 de 5 · 1:00</Eyebrow>
        <h2 className="dd-heading">Preguntá el costo. Probá antes de gastar.</h2>
        <Prompt>
          Quiero un video de fondo scroll-world con las fotos de /photos. Decime costos y los mejores modelos que aceptan primer y último fotograma.{" "}
          <b>No lo hagas, solo dame info.</b>
        </Prompt>
        <p className="sd-nota">Después: la transición más difícil en 4 modelos, y uno solo para todos los clips.</p>
      </div>
      <div className="sd-costo-video">
        <StageVideo src={`${A}/comparativa.mp4`} poster={`${A}/comparativa-poster.jpg`} label="La misma transición, del camino a la playa a la toma aérea, en cuatro modelos" />
        <ul className="sd-costo-labels" aria-label="Resultados de la prueba">
          {modelos.map((m) => (
            <li key={m.nombre} className={m.gana ? "is-gana" : undefined}>
              <b>{m.nombre}</b>
              <span>
                {m.creditos} créditos · {m.nota}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 09 · Paso 4 · Clips                                                 */
/* ------------------------------------------------------------------ */

export function ClipsSlide() {
  return (
    <SlideFrame className="sd-paso sd-clips">
      <div className="sd-paso-text">
        <Eyebrow>Paso 4 de 5 · 1:00</Eyebrow>
        <h2 className="dd-heading">Un clip por cada par de fotos.</h2>
        <div className="sd-par" aria-label="Primer fotograma: la sala. Último fotograma: el corredor.">
          <figure>
            <img src={`${A}/parada-3.webp`} alt="" draggable={false} />
            <figcaption>Primer fotograma</figcaption>
          </figure>
          <span className="sd-par-clip">
            <i />
            MiniMax H3 · 8 s
          </span>
          <figure>
            <img src={`${A}/parada-4.webp`} alt="" draggable={false} />
            <figcaption>Último fotograma</figcaption>
          </figure>
        </div>
        <Prompt tag="Prompt de cámara">
          Smooth first-person POV walk, one continuous take on a steady gimbal at eye level… settling exactly on the final frame. No zoom, no cuts, no
          fades, no people. Silent video.
        </Prompt>
      </div>
      <div className="sd-clips-side">
        <Shot src={`${A}/hf-assets.jpg`} url="higgsfield.ai/assets" alt="La biblioteca de Higgsfield con los clips del rancho generados" className="sd-clips-shot" />
        <ul className="sd-reglas">
          <li>Un solo modelo para toda la cadena.</li>
          <li>Sin audio: MiniMax lo agrega y se quita.</li>
          <li>Si un clip sale mal, repetís solo ese.</li>
        </ul>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 10 · Paso 5 · El sitio                                              */
/* ------------------------------------------------------------------ */

export function SitioSlide() {
  return (
    <SlideFrame className="sd-sitio">
      <Eyebrow>Paso 5 de 5 · 1:00</Eyebrow>
      <h2 className="dd-heading">Codex arma el sitio con las dos skills.</h2>
      <div className="sd-sitio-body">
        <div className="sd-sitio-skills">
          <article style={{ "--kit": orange } as CSSProperties}>
            <span className="sd-kit-tag">Skill 1</span>
            <h3>landing-page-design</h3>
            <p>Primero pregunta: qué ofrecés, a quién, un solo botón y solo datos reales. Después estructura, textos y SEO.</p>
          </article>
          <article style={{ "--kit": blue } as CSSProperties}>
            <span className="sd-kit-tag">Skill 2</span>
            <h3>scroll-world</h3>
            <p>Conecta los clips al scroll: tomas estáticas con texto, versión móvil y un respaldo con fotos para quien prefiere menos movimiento.</p>
          </article>
        </div>
        <div className="sd-sitio-prompt">
          <Prompt>
            Armá el recorrido con scroll-world, pero los videos ya existen: <b>no generes nada ni gastes créditos.</b> Usá las 7 fotos como tomas sin movimiento y los 6
            clips como tramos. Español e inglés, reserva por WhatsApp.
          </Prompt>
          <span className="sd-sitio-stack">
            <Pill color={charcoal}>Astro + Tailwind</Pill>
            <Pill color={blue}>2K escritorio · 720p teléfono</Pill>
            <Pill color={green}>Vercel</Pill>
          </span>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 11 · Demo                                                           */
/* ------------------------------------------------------------------ */

export function DemoSlide() {
  return (
    <SlideFrame className="sd-demo">
      <div className="sd-demo-video">
        <StageVideo src={`${A}/demo.mp4`} poster={`${A}/demo-poster.jpg`} label="Recorrido grabado del sitio: de la piscina a la toma aérea" />
      </div>
      <div className="sd-demo-side">
        <Eyebrow>Demo · 1:30</Eyebrow>
        <h2 className="dd-heading">El mismo rancho, antes y después.</h2>
        <div className="sd-qr">
          <QRCodeSVG value={SITIO} size={512} level="M" marginSize={0} bgColor="#ffffff" fgColor="#171717" title="Abrir rancho-varadero.vercel.app" />
          <span>rancho-varadero.vercel.app</span>
        </div>
        <p className="sd-nota">
          Antes: <Code>/antes</Code>
        </p>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 12 · Números reales                                                 */
/* ------------------------------------------------------------------ */

export function NumerosSlide() {
  const errores = [
    { titulo: "Un clip con un corte brusco", solucion: "Se repitió con una dirección de cámara explícita." },
    { titulo: "El modelo agrega audio", solucion: "Se quita: el sitio va en silencio." },
    { titulo: "En iPhone no se veían los videos", solucion: "Safari pide reproducirlos y pausarlos una vez." },
    { titulo: "Mucho peso para datos móviles", solucion: "720p en el teléfono, 2K en escritorio, aviso de carga." },
    { titulo: "Fotos pálidas", solucion: "Retoque con un solo prompt para todas." },
  ];
  return (
    <SlideFrame className="sd-numeros">
      <Eyebrow>Resultados · 0:30</Eyebrow>
      <h2 className="dd-heading">Lo que costó, de verdad.</h2>
      <div className="sd-numeros-body">
        <div className="sd-cifras">
          <div>
            <strong>≈218</strong>
            <span>créditos planeados · ≈ US$11</span>
          </div>
          <div>
            <strong>473.75</strong>
            <span>créditos gastados · ≈ US$23</span>
          </div>
          <div className="is-oops">
            <strong>256</strong>
            <span>en dos renders lanzados por accidente</span>
          </div>
          <figure className="sd-precios">
            <img src={`${A}/hf-precios.jpg`} alt="Planes de Higgsfield: Starter 200 créditos por US$15, Plus 1,000 créditos por US$49, Ultra 3,000 créditos por US$129 al mes" draggable={false} />
            <figcaption>Plan Plus: 1,000 créditos por US$49 al mes (≈ US$0.05 por crédito)</figcaption>
          </figure>
        </div>
        <ul className="sd-errores">
          {errores.map((e) => (
            <li key={e.titulo}>
              <b>{e.titulo}</b>
              <span>{e.solucion}</span>
            </li>
          ))}
        </ul>
        <div className="sd-qr sd-qr--guia">
          <QRCodeSVG value={GUIA} size={512} level="M" marginSize={0} bgColor="#ffffff" fgColor="#171717" title="Abrir la guía paso a paso" />
          <span>La guía con todos los prompts</span>
        </div>
      </div>
    </SlideFrame>
  );
}

/* ------------------------------------------------------------------ */
/* 13 · About Me                                                       */
/* ------------------------------------------------------------------ */

export function AboutSlide() {
  const { saul } = speakers;
  return (
    <SlideFrame className="dd-speaker sd-about">
      <div className="dd-speaker-text">
        <Eyebrow>About Me · 0:30</Eyebrow>
        <h1 className="dd-display">
          Saul
          <br />
          Calderon
        </h1>
        <ul className="sd-about-roles">
          <li>AI Product Engineer · LA startup</li>
          <li>SpaceX AI Ambassador</li>
        </ul>
        <div className="sd-about-links">
          <div className="sd-about-qr sd-about-qr--main">
            <QRCodeSVG value={LINKEDIN} size={512} level="M" marginSize={0} bgColor="#ffffff" fgColor="#171717" title="Abrir el LinkedIn de Saul Calderon" />
            <span>
              <b>LinkedIn</b>
              linkedin.com/in/saul-calderon
            </span>
          </div>
          <div className="sd-about-qr">
            <QRCodeSVG value={WEB} size={512} level="M" marginSize={0} bgColor="#ffffff" fgColor="#171717" title="Abrir saulcalderon.com" />
            <span>
              <b>Web</b>
              saulcalderon.com
            </span>
          </div>
        </div>
        <p className="sd-about-social">
          <span>
            Instagram <b>@saul_calderon14</b>
          </span>
          <span className="sd-about-ailabs">
            <AiLabsLogo className="sd-about-ailabs-logo" /> <b>@ailabs_sv</b>
          </span>
        </p>
      </div>
      <div className="dd-badge dd-badge--photo sd-about-badge">
        <img className="dd-badge-photo" src={saul.photo} alt={`Retrato de ${saul.name}`} draggable={false} />
        <span className="dd-badge-mark dd-badge-mark--heart" aria-hidden="true">
          <Mark kind="heart" color={blue} />
        </span>
        <span className="dd-badge-mark dd-badge-mark--exclaim" aria-hidden="true">
          <Mark kind="exclaim" color={green} />
        </span>
        <SlideFace face={saul.face} size={7} className="dd-badge-face" />
        <span className="dd-badge-tag">
          <span>Speaker</span>
          {DEVDAY_EVENT.date}
        </span>
      </div>
    </SlideFrame>
  );
}
