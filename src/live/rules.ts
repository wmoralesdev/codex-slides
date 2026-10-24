import type {
  CreateSessionInput,
  Participant,
  PresenterAction,
  Session,
  Vote,
} from "./types";
import { MAX_DECK_SLIDES } from "./limits";

const animals = [
  "Águila",
  "Zorro",
  "Colibrí",
  "Jaguar",
  "Lince",
  "Panda",
  "Delfín",
  "Búho",
  "Puma",
  "Koala",
  "Tucán",
  "Lobo",
];
const adjectives = [
  "veloz",
  "cósmico",
  "curioso",
  "brillante",
  "creativo",
  "audaz",
  "sereno",
  "alegre",
  "ingenioso",
  "valiente",
  "estelar",
  "sagaz",
];

export function avatarFromToken(token: string): Participant {
  let seed = 2166136261;
  for (const character of token)
    seed = Math.imul(seed ^ character.charCodeAt(0), 16777619);
  seed >>>= 0;
  const animal = animals[seed % animals.length];
  const adjective =
    adjectives[Math.floor(seed / animals.length) % adjectives.length];
  return {
    id: `guest-${seed.toString(36)}`,
    name: `${animal} ${animal === "Águila" ? adjective.replace(/o$/, "a") : adjective}`,
    seed,
  };
}

export function validateManifest(input: CreateSessionInput): void {
  if (
    !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(input.deckSlug) ||
    input.deckSlug.length > 100
  )
    throw new Error("El deck necesita un slug válido.");
  if (!input.deckTitle.trim() || input.deckTitle.length > 200)
    throw new Error("El deck necesita un título de hasta 200 caracteres.");
  if (!input.slides.length || input.slides.length > MAX_DECK_SLIDES)
    throw new Error("El deck debe tener entre 1 y 100 slides.");
  const slugs = new Set<string>();
  for (const slide of input.slides) {
    if (
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slide.slug) ||
      slide.slug.length > 100 ||
      slugs.has(slide.slug)
    )
      throw new Error("Cada slide necesita un slug único y válido.");
    slugs.add(slide.slug);
    if (!slide.title.trim() || slide.title.length > 200)
      throw new Error("Cada slide necesita un título de hasta 200 caracteres.");
    if (
      slide.kicker.length > 200 ||
      slide.guide.intro.length > 10000 ||
      (slide.guide.takeaway?.length ?? 0) > 10000 ||
      (slide.guide.sections?.length ?? 0) > 30
    )
      throw new Error("La guía de la slide es demasiado larga.");
    if (
      slide.guide.sections?.some(
        (section) => section.title.length > 200 || section.body.length > 10000,
      )
    )
      throw new Error("Una sección de la guía es demasiado larga.");
    if (!slide.question) continue;
    const question = slide.question;
    if (
      !question.id.trim() ||
      question.id.length > 100 ||
      !question.prompt.trim() ||
      question.prompt.length > 1000
    )
      throw new Error("La pregunta necesita un identificador y texto válidos.");
    if (!["poll", "single", "multiple"].includes(question.type))
      throw new Error("El tipo de pregunta no es válido.");
    if (question.options.length < 2 || question.options.length > 20)
      throw new Error("Cada pregunta necesita entre 2 y 20 opciones.");
    const optionIds = new Set<string>();
    for (const option of question.options) {
      if (
        !option.id.trim() ||
        option.id.length > 100 ||
        optionIds.has(option.id) ||
        !option.label.trim() ||
        option.label.length > 300
      )
        throw new Error(
          "Las opciones necesitan identificadores únicos y texto válido.",
        );
      optionIds.add(option.id);
    }
  }
}

export function applyPresenterAction(
  session: Session,
  action: PresenterAction,
  now: number,
): Session {
  if (session.status !== "live") throw new Error("Esta sesión ya terminó.");
  switch (action.type) {
    case "navigate":
      if (!session.slides.some((slide) => slide.slug === action.slug))
        throw new Error("La slide no existe en este deck.");
      return {
        ...session,
        activeSlideSlug: action.slug,
        showResults: false,
        qrVisible: false,
        updatedAt: now,
      };
    case "question":
      if (action.slideSlug !== session.activeSlideSlug)
        throw new Error(
          "La presentación avanzó. Controla la pregunta de la slide actual.",
        );
      if (
        action.open &&
        !session.slides.find((slide) => slide.slug === session.activeSlideSlug)
          ?.question
      )
        throw new Error("Esta slide no tiene una pregunta.");
      return {
        ...session,
        questionOpen: action.open,
        ...(action.open && !session.questionOpen
          ? {
              questionOpenedAt: Math.max(
                now,
                (session.questionOpenedAt ?? 0) + 1,
              ),
            }
          : {}),
        showResults: session.showResults || session.questionOpen || action.open,
        updatedAt: now,
      };
    case "results":
      if (action.slideSlug !== session.activeSlideSlug)
        throw new Error(
          "La presentación avanzó. Controla la pregunta de la slide actual.",
        );
      if (
        action.show &&
        !session.slides.find((slide) => slide.slug === session.activeSlideSlug)
          ?.question
      )
        throw new Error("Esta slide no tiene una pregunta.");
      // Older clients can still send this action, but results are now automatic.
      return {
        ...session,
        showResults: session.showResults || session.questionOpen || action.show,
        updatedAt: now,
      };
    case "qr":
      return { ...session, qrVisible: action.visible, updatedAt: now };
    case "theme":
      return { ...session, projectionTheme: action.theme, updatedAt: now };
    case "end":
      return {
        ...session,
        status: "ended",
        questionOpen: false,
        qrVisible: false,
        updatedAt: now,
      };
  }
}

export function resultsAreVisible(
  session: Session,
  hasCurrentVotes: boolean,
): boolean {
  return (
    !!session.slides.find((slide) => slide.slug === session.activeSlideSlug)
      ?.question &&
    (session.questionOpen || session.showResults || hasCurrentVotes)
  );
}

export function validateVote(
  session: Session,
  participantId: string,
  optionIds: string[],
  expectedSlideSlug = session.activeSlideSlug,
): Vote {
  if (session.status !== "live") throw new Error("Esta sesión ya terminó.");
  // Questions open together when the session starts, so any slide's question takes answers.
  if (!session.questionOpen)
    throw new Error("El presentador cerró las preguntas.");
  const slide = session.slides.find((item) => item.slug === expectedSlideSlug);
  const question = slide?.question;
  if (!question || !slide) throw new Error("Esta slide no tiene una pregunta.");
  const valid = new Set(question.options.map((option) => option.id));
  if (
    !optionIds.length ||
    new Set(optionIds).size !== optionIds.length ||
    optionIds.some((id) => !valid.has(id))
  )
    throw new Error("Selecciona una respuesta válida.");
  if (question.type !== "multiple" && optionIds.length !== 1)
    throw new Error("Esta pregunta permite una sola respuesta.");
  return {
    questionId: question.id,
    slideSlug: slide.slug,
    participantId,
    optionIds: [...optionIds],
  };
}
