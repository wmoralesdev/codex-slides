import { devdayHighlights } from "../../devday/event";
import type { Deck, SlideDefinition } from "../types";
import { devdayCoverSlide } from "../kit/talk";
import { withSlideInfo } from "../kit/SlideInfo";
import { AfterSlide, AgendaSlide, AnnouncementsSlide, JoinSlide, WelcomeSlide } from "./EventSlides";

const deckTitle = "Bienvenida";
const total = "05";
const info = (n: number) => ({ deckTitle, number: String(n).padStart(2, "0"), total });

const slides: SlideDefinition[] = [
  devdayCoverSlide,
  {
    slug: "bienvenida",
    title: "Una tarde para construir con IA",
    kicker: "Bienvenida · 1:00",
    component: withSlideInfo(WelcomeSlide, info(1)),
    guide: {
      intro:
        "Bienvenido a DevDay Exchange San Salvador, un evento de comunidad organizado por Ai Labs a partir de los anuncios de OpenAI DevDay 2026.",
      takeaway: "Esta guía te acompaña toda la tarde: cada charla tiene la suya.",
    },
    question: {
      id: "bienvenida-uso-ia",
      prompt: "¿Cuánto usás IA para construir hoy?",
      type: "single",
      options: [
        { id: "diario", label: "Todos los días" },
        { id: "semanal", label: "Algunas veces por semana" },
        { id: "probando", label: "Estoy empezando" },
        { id: "nada", label: "Todavía no" },
      ],
    },
    speakerNotes: { script: "Saludo, quién organiza y qué va a pasar en la tarde.", timing: "1:00" },
  },
  {
    slug: "anuncios",
    title: "Lo que trajo DevDay",
    kicker: "Contexto · 1:30",
    component: withSlideInfo(AnnouncementsSlide, info(2)),
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
    component: withSlideInfo(AgendaSlide, info(3)),
    guide: {
      intro: "Walter abre con Codex, Daniela sigue con Notion, después Rodrigo con video, Saul con sitios web dinámicos y Fernando con asistentes entre herramientas. El tema de Frank está por confirmar. Reservamos quince minutos por charla.",
    },
    speakerNotes: { script: "Presentá a cada speaker por nombre, en orden.", timing: "1:00" },
  },
  {
    slug: "participa",
    title: "Participá desde tu teléfono",
    kicker: "Cómo participar · 0:45",
    component: withSlideInfo(JoinSlide, info(4)),
    guide: {
      intro: "Cada charla tiene un QR para seguirla en el teléfono, con su guía y sus encuestas.",
      takeaway: "Usá las flechas para leer a tu ritmo y «Volver al vivo» para alcanzar al speaker.",
    },
    speakerNotes: { script: "Mostrá el QR en proyección mientras explicás.", timing: "0:45", interaction: "Mostrar QR en proyección." },
  },
  {
    slug: "despues",
    title: "Después de las charlas",
    kicker: "Cierre · 0:45",
    component: withSlideInfo(AfterSlide, info(5)),
    guide: {
      intro: "La conversación sigue en la terraza. Compartí lo que te llevás con #DevDayCommunity.",
    },
    speakerNotes: { script: "Invitá a la primera charla.", timing: "0:45" },
  },
];

export const eventDeck: Deck = {
  slug: "devday-exchange-san-salvador",
  title: "DevDay Exchange San Salvador",
  description:
    "La apertura del evento: bienvenida, lo que trajo DevDay 2026, la agenda de las seis charlas y cómo participar desde el teléfono.",
  category: "Apertura",
  duration: "5 min",
  accent: "#0066ff",
  firstSlideNumber: 0,
  slides,
};
