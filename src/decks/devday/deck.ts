import { devdayHighlights } from "../../devday/event";
import type { Deck, SlideDefinition } from "../types";
import { devdayCoverSlide } from "../kit/talk";
import { talkDecks } from "../talks";
import { withSlideInfo } from "../kit/SlideInfo";
import { AgendaSlide, AnnouncementsSlide, makePauseDemoSlide } from "./EventSlides";

const deckTitle = "Bienvenida";
const total = "02";
const info = (n: number) => ({ deckTitle, number: String(n).padStart(2, "0"), total });

const slides: SlideDefinition[] = [
  devdayCoverSlide,
  {
    slug: "anuncios",
    title: "Lo que trajo DevDay",
    kicker: "Contexto · 1:30",
    component: withSlideInfo(AnnouncementsSlide, info(1)),
    guide: {
      intro: "OpenAI presentó DevDay 2026 el 29 de septiembre en San Francisco. Estos anuncios abren posibilidades para el trabajo, los estudios y los proyectos de todos los días.",
      sections: devdayHighlights.map(({ tag, title, body }) => ({ title: `${title} · ${tag}`, body })),
      takeaway: "Las charlas conectan estas novedades con ejemplos prácticos. La edición de video es una aplicación propuesta de Codex, no un editor nativo anunciado en DevDay.",
    },
    speakerNotes: {
      script: "Explicá cada anuncio desde una situación cotidiana. API es una conexión entre programas; un agente es un asistente que puede usar herramientas. No asumir experiencia técnica.",
      timing: "1:30",
      cues: ["Fuente: https://openai.com/index/devday-2026-recap/ (consultada el 23 oct 2026). Confirmar acceso en la cuenta de cada demo. Decisions figura en beta pública en https://developers.openai.com/api/docs/guides/decisions; no asignarlo como tema de Frank."],
    },
  },
  {
    slug: "agenda",
    title: "La agenda de hoy",
    kicker: "Agenda · 1:00",
    component: withSlideInfo(AgendaSlide, info(2)),
    guide: {
      intro: "Walter abre con Codex, Daniela sigue con Notion, después Rodrigo con video, Saul con sitios web dinámicos y Fernando con asistentes entre herramientas. El tema de Frank está por confirmar. Reservamos quince minutos por charla.",
    },
    speakerNotes: { script: "Presentá a cada speaker por nombre, en orden.", timing: "1:00" },
  },
];

type PauseDemo = { id: string; project: string; author?: string; duration: string };

/** Community demos played in the pause before each talk, in order. Videos live in public/demos. */
const pauseDemos: Record<string, PauseDemo[]> = {
  "codex-en-la-nube": [
    { id: "biocore", project: "BIOCORE", author: "Fernando Serrano", duration: "1:08" },
    { id: "eku", project: "Ekü", duration: "0:56" },
  ],
  "notion-codex": [{ id: "bedrock", project: "Bedrock", author: "Bryan Rivera Mendoza", duration: "1:30" }],
  "video-con-codex": [{ id: "lau", project: "LaU", author: "Mateo Canales", duration: "1:58" }],
  "sitios-dinamicos": [{ id: "miaubit", project: "La Expedición de Miaubit", author: "Diego Henríquez y Josue Sandoval", duration: "2:00" }],
  "agents-api": [{ id: "mentarie", project: "Mentarie", author: "Anibal Andrade e Isaac Medrano", duration: "2:01" }],
  "decisions-api": [{ id: "reporte-ciudadano", project: "Reporte Ciudadano SV", author: "Cristian Parada Mendoza", duration: "2:07" }],
};

/** Before each talk, community demos play full screen while its speaker sets up. */
const pause = (slug: string, title: string): SlideDefinition[] =>
  pauseDemos[slug].map((demo, i) => {
    const by = demo.author ? `, de ${demo.author}` : "";
    const label = `Demo de la comunidad: ${demo.project}${by}`;
    return {
      slug: i === 0 ? `pausa-${slug}` : `pausa-${slug}-${i + 1}`,
      title: `Pausa · ${demo.project}`,
      kicker: `Demo de la comunidad · ${demo.duration}`,
      component: makePauseDemoSlide(demo.id, label),
      ambientMotion: true,
      guide: { intro: `Mientras se prepara «${title}», mirá ${demo.project}, una demo de la comunidad${by}.` },
      speakerNotes: {
        script: `Video de ${demo.project}${by} mientras se prepara el siguiente speaker. Arranca solo en la proyección; el presentador lo escucha en silencio.`,
        timing: `${demo.duration} · fuera del tiempo de charla`,
      },
    };
  });

/**
 * The whole afternoon runs from this deck: each talk follows in agenda order,
 * after a blank slide and without its own waiting cover. Its slugs get the
 * talk's prefix so they stay unique next to the others. Question ids already are.
 */
const talkSlides: SlideDefinition[] = talkDecks.flatMap((deck) => [
  ...pause(deck.slug, deck.title),
  ...deck.slides
    .filter((slide) => slide.slug !== devdayCoverSlide.slug)
    .map((slide) => ({ ...slide, slug: `${deck.slug}-${slide.slug}` })),
]);

export const eventDeck: Deck = {
  slug: "devday-exchange-san-salvador",
  title: "DevDay Exchange San Salvador",
  description:
    "La tarde completa: lo que trajo DevDay 2026 y la agenda, y después las seis charlas en orden, con una pausa entre cada una.",
  category: "Apertura",
  duration: "1 h 40 min",
  accent: "#0066ff",
  firstSlideNumber: 0,
  slides: [...slides, ...talkSlides],
};
