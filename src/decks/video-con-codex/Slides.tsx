import { useEffect, useRef, useState, type ReactNode } from "react";
import { speakers } from "../../devday/speakers";
import { Crowd } from "../kit/Crowd";
import { closingCrowd } from "../kit/crowd-layout";
import { Eyebrow, SlideFace, SlideFrame } from "../kit/layouts";
import { useSlideInfo } from "../kit/SlideInfo";
import "./video-con-codex.css";
import giftQr from "./agentic-edition-studio-qr.png";
import reelFrame from "./reel-editar-con-codigo.jpg";
import rodRunQr from "./rod-run-qr.png";
import footerFace from "./pages/footer-face.svg?raw";
import apertura from "./pages/01-apertura.html?raw";
import desafio from "./pages/02-el-desafio.html?raw";
import cuatroProblemas from "./pages/03-cuatro-problemas.html?raw";
import fotosSueltas from "./pages/04-fotos-sueltas.html?raw";
import elegirFotogramas from "./pages/05-elegir-fotogramas.html?raw";
import textoEnPantalla from "./pages/06-texto-en-pantalla.html?raw";
import movimiento from "./pages/07-movimiento.html?raw";
import escuchar from "./pages/08-escuchar.html?raw";
import ffmpegMide from "./pages/09-ffmpeg-mide.html?raw";
import mapaDeSonido from "./pages/10-mapa-de-sonido.html?raw";
import dondeEdita from "./pages/11-donde-edita.html?raw";
import edicionComoCodigo from "./pages/12-edicion-como-codigo.html?raw";
import taller from "./pages/13-el-taller.html?raw";
import bibliotecaDeEfectos from "./pages/14-biblioteca-de-efectos.html?raw";
import criterioEnArchivos from "./pages/15-criterio-en-archivos.html?raw";
import aplicarElCriterio from "./pages/16-aplicar-el-criterio.html?raw";
import sistemaCompleto from "./pages/17-sistema-completo.html?raw";
import sureshot from "./pages/18-sureshot.html?raw";

/*
 * Every slide is the rendered markup of one page of
 * Presentacion_DevDay_Codex_Edicion_Video_v2.html, with its own styles
 * (video-con-codex.css). Only the footer is drawn here, so the number
 * follows the deck instead of the original 19 pages.
 */

type PageProps = {
  html: string;
  className?: string;
  label?: string;
  footer?: boolean;
  onMount?: (slide: HTMLElement) => () => void;
  /** Additions that are not in the original HTML. */
  children?: ReactNode;
};

function Page({ html, className = "", label, footer = true, onMount, children }: PageProps) {
  const info = useSlideInfo();
  const ref = useRef<HTMLElement>(null);
  useEffect(() => (ref.current && onMount ? onMount(ref.current) : undefined), [onMount]);
  return (
    <section ref={ref} className={`slide-canvas vcx is-live ${className}`} aria-label={label}>
      <div className="vcx-body" dangerouslySetInnerHTML={{ __html: html }} />
      {children}
      {footer && (
        <footer className="footer">
          <span>
            <span className="face" dangerouslySetInnerHTML={{ __html: footerFace }} />
            Rodrigo Garciaguirre · Cómo enseñarle a Codex a editar video
          </span>
          <span>
            DevDay Exchange San Salvador
            {info && (
              <b>
                {info.number}
                <i> / {info.total}</i>
              </b>
            )}
          </span>
        </footer>
      )}
    </section>
  );
}

/* The sampler from the original: the two buttons switch the sampling strategy. */
const MODES = {
  fixed: { pick: [0, 2, 4, 6], count: 4, title: "El instante importante queda entre dos muestras.", text: "Se miran 00:00, 00:02, 00:04 y 00:06. La mano levantada en 00:03 nunca llega al modelo.", state: "Evento perdido" },
  event: { pick: [0, 3, 4], count: 3, title: "Menos fotogramas y el evento queda adentro.", text: "El primer cuadro, más los que superan el umbral: 00:03 (aparece la mano) y 00:04 (desaparece).", state: "Evento detectado" },
};
type Mode = keyof typeof MODES;

function mountSampler(slide: HTMLElement) {
  const root = slide.querySelector<HTMLElement>(".sampler");
  if (!root) return () => {};
  const set = (mode: Mode) => {
    const m = MODES[mode];
    root.dataset.mode = mode;
    root.querySelectorAll<HTMLButtonElement>(".seg button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.mode === mode)));
    root.querySelectorAll<HTMLElement>(".cell").forEach((c) => c.classList.toggle("pick", m.pick.includes(Number(c.dataset.t))));
    root.querySelector("#vCount")!.innerHTML = `${m.count}<small>fotogramas</small>`;
    root.querySelector("#vTitle")!.textContent = m.title;
    root.querySelector("#vText")!.textContent = m.text;
    root.querySelector("#vState")!.textContent = m.state;
  };
  const onClick = (event: Event) => {
    const button = (event.target as HTMLElement).closest<HTMLButtonElement>(".seg button");
    if (button?.dataset.mode) set(button.dataset.mode as Mode);
  };
  root.addEventListener("click", onClick);
  return () => root.removeEventListener("click", onClick);
}

export const AperturaSlide = () => <Page html={apertura} className="cover" label="Cómo enseñarle a Codex a editar video" />;
export const DesafioSlide = () => <Page html={desafio} />;
export const CuatroProblemasSlide = () => <Page html={cuatroProblemas} />;
export const FotosSueltasSlide = () => <Page html={fotosSueltas} />;
export const ElegirFotogramasSlide = () => <Page html={elegirFotogramas} onMount={mountSampler} />;
export const TextoEnPantallaSlide = () => <Page html={textoEnPantalla} />;
export const MovimientoSlide = () => <Page html={movimiento} />;
export const EscucharSlide = () => <Page html={escuchar} />;
export const FfmpegMideSlide = () => <Page html={ffmpegMide} />;
export const MapaDeSonidoSlide = () => <Page html={mapaDeSonido} />;
export const DondeEditaSlide = () => <Page html={dondeEdita} />;
export const EdicionComoCodigoSlide = () => <Page html={edicionComoCodigo} />;
export const TallerSlide = () => <Page html={taller} />;
export const BibliotecaDeEfectosSlide = () => <Page html={bibliotecaDeEfectos} />;
export const CriterioEnArchivosSlide = () => <Page html={criterioEnArchivos} />;
export const AplicarElCriterioSlide = () => <Page html={aplicarElCriterio.replace("{{reel}}", reelFrame)} />;
export const SistemaCompletoSlide = () => <Page html={sistemaCompleto} />;
export const SureshotSlide = () => (
  <Page html={sureshot}>
    <aside className="gift">
      <img src={giftQr} alt="Código QR a github.com/RoderickGrc/agentic-edition-studio" />
      <div>
        <b>Regalo</b>
        <p>Todo este sistema, disponible para ti.</p>
      </div>
      <code>
        github.com/RoderickGrc/
        <br />
        agentic-edition-studio
      </code>
    </aside>
  </Page>
);
/* Not in the original: the gift QR at full size, in case the corner one is too small to scan. */
export const RegaloSlide = () => (
  <Page html="">
    <div className="regalo">
      <div>
        <p className="eyebrow">Regalo</p>
        <h2 className="heading">Todo este sistema, disponible para ti.</h2>
        <p className="lead">sureshot para percibir, Remotion para editar y la wiki para decidir, en un solo repositorio.</p>
        <code>github.com/RoderickGrc/agentic-edition-studio</code>
      </div>
      <img src={giftQr} alt="Código QR a github.com/RoderickGrc/agentic-edition-studio" />
    </div>
  </Page>
);
/* The pipeline reel, stored in public/. Plays with sound on click; Space stays with the video. */
function DemoVideo() {
  const ref = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false);
  return (
    <div className="demo-video">
      <video
        ref={ref}
        src="/talks/video-con-codex/reel.mp4"
        poster="/talks/video-con-codex/reel-poster.jpg"
        controls={started}
        playsInline
        preload="metadata"
        tabIndex={0}
        onPlay={() => setStarted(true)}
        onKeyDown={(event) => {
          // Space stays with the player (it pauses or resumes) instead of advancing the slide.
          if (event.key === " ") event.stopPropagation();
        }}
        aria-label="Reel del pipeline: cómo Codex aprende a ver, escuchar, editar, seguir reglas y revisar un video"
      />
      {!started && (
        <button
          type="button"
          className="demo-play"
          onClick={() => {
            ref.current?.focus();
            void ref.current?.play();
          }}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 5.5v13l11-6.5z" fill="currentColor" />
          </svg>
          Reproducir con sonido
        </button>
      )}
    </div>
  );
}

export const ALasDemosSlide = () => (
  <Page html="" footer={false}>
    <div className="demo">
      <div>
        <p className="eyebrow">El sistema en la práctica · 0:40</p>
        <h2 className="display">
          Ya tiene ojos, oídos y herramientas. <span>Veamos el pipeline completo.</span>
        </h2>
      </div>
      <DemoVideo />
      <p className="demo-time">
        <b>0:40</b>
        un reel sobre este pipeline, editado y verificado con él
      </p>
    </div>
  </Page>
);

/* Replaces the kit's closing slide: thanks, with rod.run first and its QR. */
export function GraciasSlide() {
  return (
    <SlideFrame className="dd-closing vc-thanks" footer={false}>
      <Crowd faces={closingCrowd({ x: 40, y: 18 })} className="dd-closing-crowd" />
      <div className="vc-thanks-text">
        <Eyebrow>¿Preguntas?</Eyebrow>
        <h1 className="dd-display">
          Gracias.
          <SlideFace face={{ ...speakers.rodrigo.face, gaze: { x: -0.3, y: 0.35 } }} size={9} className="dd-closing-face" />
        </h1>
        <p className="dd-lead">Si quieres conocer más de lo que hago, visita mi página:</p>
        <p className="vc-thanks-url">rod.run</p>
        <p className="vc-thanks-alt">
          o háblame en LinkedIn: <strong>linkedin.com/in/rodgrc</strong>
        </p>
      </div>
      <img className="vc-thanks-qr" src={rodRunQr} alt="Código QR a rod.run" />
    </SlideFrame>
  );
}
