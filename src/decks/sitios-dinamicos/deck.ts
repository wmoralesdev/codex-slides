import { speakers } from "../../devday/speakers";
import { defineTalk } from "../kit/talk";
import {
  AboutSlide,
  AntesDespuesSlide,
  ClipsSlide,
  ConectarSlide,
  CostoSlide,
  DemoSlide,
  KeyframesSlide,
  NecesitasSlide,
  NumerosSlide,
  QueEsSlide,
  SitioSlide,
} from "./Slides";

export const sitiosDinamicosDeck = defineTalk({
  slug: "sitios-dinamicos",
  title: "Generación de sitios web dinámicos con Codex y Higgsfield",
  description:
    "Cómo convertir fotos de un lugar en un sitio que se recorre con el scroll: Codex escribe el código y Higgsfield genera las imágenes y los videos.",
  topic: "Codex · Higgsfield",
  speaker: speakers.saul,
  accent: "#0066ff",
  brief: {
    goal: "De fotos de un lugar a un sitio que se recorre con el scroll.",
    topics: [
      "Qué es un sitio con scroll dinámico y por qué se recuerda.",
      "El paso a paso: conectar Higgsfield, preparar las fotos, generar los clips y armar el sitio con Codex.",
      "Lo que costó de verdad y los errores que conviene evitar.",
    ],
    demo: "Rancho Varadero, un rancho de playa real en Playa El Amatal: el sitio básico y la versión con recorrido, publicados en rancho-varadero.vercel.app.",
    takeaway: "Las fotos y los clips son el trabajo; el código lo escribe Codex.",
    preparation: [
      "Pestañas abiertas antes de empezar: rancho-varadero.vercel.app/antes y rancho-varadero.vercel.app. Abrí el recorrido un minuto antes: descarga los clips en 2K (unos 70 MB) y muestra «Cargando el recorrido · n/6».",
      "El scroll del sitio es libre. Para avanzar con ↓ o espacio a 6 s por tramo, en esa pestaña entrá a rancho-varadero.vercel.app/opciones, elegí «Guiado toma a toma» y volvé a /: queda activo en esa pestaña.",
      "Respaldo: la slide de demo tiene el recorrido grabado; reproducilo si falla el wifi.",
      "Rancho Varadero es un negocio real (Alquileres MM) y hay permiso para mostrarlo. No mencionar precios del rancho.",
      "Las cifras de créditos son las reales del proyecto (research/rancho-varadero-costs.md). Los 256 créditos de Seedance fueron dos renders lanzados por accidente. Dólares calculados con el plan Plus de Higgsfield: US$49 por 1,000 créditos al mes (página de precios, 24 oct 2026).",
      "La guía completa con todos los prompts está en github.com/saulcalderon/rancho-varadero (GUIA.md).",
    ],
  },
  openingQuestion: {
    id: "sitios-dinamicos-ia",
    prompt: "¿Ya hiciste un sitio web con IA?",
    type: "single",
    options: [
      { id: "publicado", label: "Sí, y lo publiqué" },
      { id: "probado", label: "Lo intenté" },
      { id: "todavia", label: "Todavía no" },
      { id: "no-sabia", label: "No sabía que se podía" },
    ],
  },
  outline: [
    {
      slug: "antes-y-despues",
      title: "De esto… a esto",
      kicker: "Contexto · 1:00",
      component: AntesDespuesSlide,
      guide: {
        intro:
          "El mismo rancho, dos sitios. El primero usa una plantilla genérica con las fotos tal cual. El segundo se recorre con el scroll: la cámara camina de la piscina a la playa.",
        takeaway: "Mismo negocio, mismas fotos. Cambia la experiencia.",
      },
      speakerNotes: {
        script: "Mostrá las dos capturas. Contá que es un rancho real de playa en El Amatal y que las dos versiones están publicadas.",
        timing: "1:00",
        cues: ["Si hay tiempo, abrí /antes en vivo y hacé scroll: nada se mueve."],
      },
    },
    {
      slug: "que-es",
      title: "El scroll no reproduce el video: lo mueve",
      kicker: "Concepto · 1:00",
      component: QueEsSlide,
      guide: {
        intro:
          "Siete fotos son las tomas sin movimiento del recorrido. Seis clips generados con IA conectan cada toma con la siguiente. Al hacer scroll, el sitio adelanta o retrocede el video, como en las páginas de producto de Apple.",
        sections: [{ title: "La regla", body: "Cada clip empieza exactamente donde termina el anterior, así el recorrido se ve como una sola toma." }],
        takeaway: "Scroll hacia abajo, la cámara avanza. Scroll hacia arriba, retrocede.",
      },
      speakerNotes: {
        script: "Explicá con la tira: fotos arriba, clips entre ellas. El scroll controla el tiempo del video, no lo reproduce.",
        timing: "1:00",
      },
    },
    {
      slug: "lo-que-necesitas",
      title: "Lo que necesitás",
      kicker: "Preparación · 0:30",
      component: NecesitasSlide,
      guide: {
        intro:
          "Codex con Sol o Astra en esfuerzo alto escribe el código. Higgsfield reúne los modelos de imagen y video. Dos skills le enseñan al agente cómo diseñar la página y cómo armar el recorrido. Y fotos reales del lugar.",
        sections: [
          { title: "Skill", body: "Un paquete de instrucciones que el agente sigue para una tarea." },
          { title: "MCP", body: "Un puente que conecta al agente con otra herramienta, como Higgsfield." },
        ],
      },
      speakerNotes: { script: "Recorré las cuatro tarjetas rápido. Definí skill y MCP en una frase cada una.", timing: "0:30" },
    },
    {
      slug: "paso-1-conectar",
      title: "Paso 1 · Conectá Higgsfield con Codex",
      kicker: "Paso 1 de 5 · 1:00",
      component: ConectarSlide,
      guide: {
        intro:
          "En higgsfield.ai, la sección MCP da la dirección del servidor: mcp.higgsfield.ai/mcp. Agregala como servidor MCP en Codex e iniciá sesión con tu cuenta. Después instalá las dos skills en el proyecto.",
        sections: [
          { title: "Skills", body: "scroll-world: npx skills add oso95/scroll-world -a codex · landing-page-design: pegá su SKILL.md en AGENTS.md." },
          { title: "Alternativa", body: "La CLI de Higgsfield: npm i -g @higgsfield/cli y higgsfield auth login." },
        ],
        takeaway: "Un minuto de configuración y Codex ya puede generar imágenes y videos.",
      },
      speakerNotes: {
        script: "Mostrá la página MCP de Higgsfield y los tres pasos de conexión. Aclará que en ChatGPT es un plugin y en Codex es el mismo servidor MCP.",
        timing: "1:00",
      },
    },
    {
      slug: "paso-2-keyframes",
      title: "Paso 2 · De fotos a keyframes",
      kicker: "Paso 2 de 5 · 1:00",
      component: KeyframesSlide,
      guide: {
        intro:
          "Elegí las fotos y ponelas en el orden del recorrido. Llevá todas a 16:9 (recorte o outpaint), subiles la resolución y retocalas con el mismo prompt para que tengan la misma luz.",
        sections: [
          { title: "Lo que usamos", body: "8 fotos → 7 tomas sin movimiento · outpaint en 2 · upscale · retoque con GPT Image 2.5." },
          { title: "Por qué importa", body: "Los clips heredan la luz y la resolución de estas imágenes." },
        ],
        takeaway: "Imágenes parejas, recorrido parejo.",
      },
      speakerNotes: {
        script: "Mostrá el antes y después de la toma aérea: estaba pálida y con bruma. Leé la idea del prompt: misma composición, luz natural, ni pálida ni saturada.",
        timing: "1:00",
        cues: ["En la prueba, GPT Image 2.5 dio la mejor luz; Nano Banana Pro fue el más fiel pero dejó pálida la aérea; Seedream saturó los rojos."],
      },
    },
    {
      slug: "paso-3-costo",
      title: "Paso 3 · Preguntá el costo y probá antes de gastar",
      kicker: "Paso 3 de 5 · 1:00",
      component: CostoSlide,
      guide: {
        intro:
          "Antes de generar, pedile a Codex una tabla de modelos y costos sin ejecutar nada. Después probá la transición más difícil en tres o cuatro modelos y elegí uno solo para todos los clips.",
        sections: [{ title: "La prueba", body: "Kling 4.0 atravesó una palmera, Kling 3.0 arrancó lento, Seedance costó 8 veces más. Ganó MiniMax H3: 2K, el movimiento más suave, 16 créditos por clip." }],
        takeaway: "«No lo hagas, solo dame info» ahorra créditos.",
      },
      speakerNotes: {
        script: "Leé el prompt de costos. Mostrá el video de los cuatro modelos y señalá el ganador.",
        timing: "1:00",
      },
    },
    {
      slug: "paso-4-clips",
      title: "Paso 4 · Un clip por cada par de fotos",
      kicker: "Paso 4 de 5 · 1:00",
      component: ClipsSlide,
      guide: {
        intro:
          "Cada clip usa una foto como primer fotograma y la siguiente como último. Así las uniones coinciden. Se generan seis clips de 8 segundos, todos con el mismo modelo y el mismo estilo de cámara.",
        sections: [
          { title: "El prompt de cámara", body: "Caminata en primera persona, una sola toma con gimbal, sin zoom, sin cortes, sin personas, termina exactamente en el último fotograma." },
          { title: "Si sale mal", body: "Se repite solo ese clip. Un clip tuvo un corte brusco y se corrigió con una dirección de cámara explícita." },
        ],
        takeaway: "Clips cortos entre fotos: si uno falla, repetís uno.",
      },
      speakerNotes: {
        script: "Explicá primer y último fotograma con el diagrama. Mencioná que MiniMax agrega audio y se quita, porque el sitio va sin sonido.",
        timing: "1:00",
      },
    },
    {
      slug: "paso-5-sitio",
      title: "Paso 5 · Codex arma el sitio con las dos skills",
      kicker: "Paso 5 de 5 · 1:00",
      component: SitioSlide,
      guide: {
        intro:
          "Con landing-page-design, Codex primero pregunta: qué se ofrece, para quién, un solo botón de acción y solo datos reales. Con scroll-world conecta los clips al scroll, sin generar nada nuevo.",
        sections: [{ title: "Lo que entrega", body: "Tomas estáticas con texto, español e inglés, reserva por WhatsApp, clips en 2K para escritorio y 720p para teléfono con aviso de carga, y un respaldo con fotos para quien prefiere menos movimiento." }],
        takeaway: "Los videos ya existen: el agente solo los conecta.",
      },
      speakerNotes: {
        script: "Leé el prompt de armado. Remarcá «no generes nada ni gastes créditos».",
        timing: "1:00",
      },
    },
    {
      slug: "demo",
      title: "Demo: el mismo rancho, antes y después",
      kicker: "Demo · 1:30",
      component: DemoSlide,
      ambientMotion: true,
      guide: {
        intro:
          "Abrí rancho-varadero.vercel.app en tu teléfono. Hacé scroll y la cámara camina por el rancho, de la piscina a la playa.",
        takeaway: "Probalo ahora con el QR.",
      },
      speakerNotes: {
        script: "Cambiá al navegador: primero /antes, después el recorrido con el scroll (o con ↓ si activaste el modo guiado). Si falla la red, el video de la slide es el respaldo.",
        timing: "1:30",
        interaction: "Invitar a escanear el QR.",
      },
    },
    {
      slug: "numeros-reales",
      title: "Lo que costó, de verdad",
      kicker: "Resultados · 0:30",
      component: NumerosSlide,
      guide: {
        intro:
          "El plan era gastar unos 218 créditos (≈ US$11). Se gastaron 473.75 (≈ US$23): 256 fueron dos renders de Seedance lanzados por accidente. Los seis clips con MiniMax H3 costaron 96 créditos, unos US$4.70.",
        sections: [{ title: "Errores que conviene evitar", body: "Un clip con un corte brusco · modelos que agregan audio · videos que no aparecían en iPhone · mucho peso para datos móviles · fotos pálidas." }],
        takeaway: "La guía completa, con todos los prompts, está en el repositorio.",
      },
      speakerNotes: {
        script: "Leé los tres números grandes. Contá el error de los 256 créditos con humor. El de iPhone es el más útil: Safari no muestra un video en pausa que nunca se reprodujo. Cerrá con el QR a la guía.",
        timing: "0:30",
      },
    },
    {
      slug: "about-me",
      title: "About Me",
      kicker: "About Me · 0:30",
      component: AboutSlide,
      guide: {
        intro: "Saul Calderon es AI Product Engineer en una startup de Los Ángeles y SpaceX AI Ambassador. Donde más publica es en LinkedIn.",
        sections: [
          { title: "LinkedIn", body: "linkedin.com/in/saul-calderon" },
          { title: "Web", body: "saulcalderon.com" },
          { title: "Instagram", body: "@saul_calderon14 · Ai Labs: @ailabs_sv" },
        ],
        takeaway: "Escaneá el QR de LinkedIn y seguimos la conversación ahí.",
      },
      speakerNotes: {
        script: "Presentate en una frase y señalá el QR de LinkedIn. El de la web abre saulcalderon.com: confirmá que esté publicada antes de la charla.",
        timing: "0:30",
      },
    },
  ],
});
