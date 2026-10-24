import { devdayHighlights } from "../../devday/event";
import type { Deck, SlideDefinition } from "../types";
import { devdayCoverSlide } from "../kit/talk";
import { talkDecks } from "../talks";
import { withSlideInfo } from "../kit/SlideInfo";
import { AgendaSlide, AnnouncementsSlide, BlankSlide } from "./EventSlides";

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

/** Empty slide before each talk, while its speaker sets up. */
const pause = (slug: string, title: string): SlideDefinition => ({
  slug: `pausa-${slug}`,
  title: `Pausa · ${title}`,
  kicker: "Cambio de speaker",
  component: BlankSlide,
  guide: { intro: `Sigue «${title}». Empieza en unos minutos.` },
  speakerNotes: { script: "Slide en blanco mientras se prepara el siguiente speaker.", timing: "Fuera del tiempo de charla" },
});

/**
 * The whole afternoon runs from this deck: each talk follows in agenda order,
 * after a blank slide and without its own waiting cover. Its slugs get the
 * talk's prefix so they stay unique next to the others. Question ids already are.
 */
const talkSlides: SlideDefinition[] = talkDecks.flatMap((deck) => [
  pause(deck.slug, deck.title),
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
