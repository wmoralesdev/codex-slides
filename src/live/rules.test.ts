import { describe, expect, it } from "vitest";
import {
  applyPresenterAction,
  avatarFromToken,
  validateManifest,
  validateVote,
} from "./rules";
import { publicSnapshot, recordVote, requirePresenter } from "./local";
import type { LocalRecord } from "./local";
import type { CreateSessionInput, Session } from "./types";

const manifest: CreateSessionInput = {
  deckSlug: "engineering",
  deckTitle: "Grok bot for Engineering",
  slides: [
    {
      slug: "welcome",
      title: "Bienvenidos",
      kicker: "01",
      guide: { intro: "Primera guía" },
      question: {
        id: "used-grok",
        prompt: "¿Ya usaste Grok bot?",
        type: "poll",
        options: [
          { id: "yes", label: "Sí" },
          { id: "no", label: "No" },
        ],
      },
    },
    {
      slug: "workflow",
      title: "Workflow",
      kicker: "02",
      guide: { intro: "Segunda guía" },
      question: {
        id: "use-cases",
        prompt: "¿Para qué lo usarías?",
        type: "multiple",
        options: [
          { id: "code", label: "Código" },
          { id: "review", label: "Reviews" },
        ],
      },
    },
    {
      slug: "closing",
      title: "Cierre",
      kicker: "03",
      guide: { intro: "Gracias" },
    },
  ],
};

const session: Session = {
  ...manifest,
  id: "session",
  namespace: "test",
  activeSlideSlug: "welcome",
  questionOpen: true,
  showResults: false,
  status: "live",
  createdAt: 1,
  updatedAt: 1,
};
const record: LocalRecord = {
  session,
  presenterKey: "presenter-secret",
  participants: [
    { id: "one", name: "Águila veloz", seed: 1, token: "token-one" },
    { id: "two", name: "Zorro brillante", seed: 2, token: "token-two" },
  ],
  votes: [
    {
      participantId: "one",
      questionId: "used-grok",
      slideSlug: "welcome",
      optionIds: ["yes"],
    },
  ],
};

describe("manifiesto y estado de una presentación", () => {
  it("acepta componentes independientes con metadata válida", () =>
    expect(() => validateManifest(manifest)).not.toThrow());
  it("rechaza slides y opciones con identificadores repetidos", () => {
    expect(() =>
      validateManifest({
        ...manifest,
        slides: [manifest.slides[0], manifest.slides[0]],
      }),
    ).toThrow("slug único");
    const duplicate = structuredClone(manifest);
    duplicate.slides[0].question!.options[1].id = "yes";
    expect(() => validateManifest(duplicate)).toThrow("identificadores únicos");
  });
  it("al navegar mantiene las preguntas abiertas y reinicia los indicadores de la slide y el QR", () => {
    expect(
      applyPresenterAction(
        {
          ...session,
          showResults: true,
          qrVisible: true,
          projectionTheme: "light",
        },
        { type: "navigate", slug: "workflow" },
        2,
      ),
    ).toMatchObject({
      activeSlideSlug: "workflow",
      questionOpen: true,
      showResults: false,
      qrVisible: false,
      projectionTheme: "light",
      updatedAt: 2,
    });
  });
  it("abrir muestra resultados automáticamente y cerrar conserva el recuento", () => {
    const opened = applyPresenterAction(
      { ...session, questionOpen: false },
      { type: "question", open: true, slideSlug: "welcome" },
      2,
    );
    expect(opened).toMatchObject({ questionOpen: true, showResults: true });
    const closed = applyPresenterAction(
      opened,
      { type: "question", open: false, slideSlug: "welcome" },
      3,
    );
    expect(closed).toMatchObject({ questionOpen: false, showResults: true });
    expect(
      applyPresenterAction(
        closed,
        { type: "results", show: false, slideSlug: "welcome" },
        4,
      ).showResults,
    ).toBe(true);
    expect(
      applyPresenterAction(
        session,
        { type: "question", open: false, slideSlug: "welcome" },
        2,
      ).showResults,
    ).toBe(true);
  });
  it("identifica cada apertura incluso dentro del mismo milisegundo", () => {
    const open = { type: "question", open: true, slideSlug: "welcome" } as const;
    const opened = applyPresenterAction(
      { ...session, questionOpen: false },
      open,
      10,
    );
    expect(opened.questionOpenedAt).toBe(10);
    const repeated = applyPresenterAction(opened, open, 11);
    expect(repeated.questionOpenedAt).toBe(10);
    const closed = applyPresenterAction(
      repeated,
      { ...open, open: false },
      11,
    );
    expect(closed.questionOpenedAt).toBe(10);
    const reopened = applyPresenterAction(closed, open, 10);
    expect(reopened.questionOpenedAt).toBe(11);
    const moved = applyPresenterAction(
      reopened,
      { type: "navigate", slug: "workflow" },
      12,
    );
    expect(moved.questionOpenedAt).toBe(11);
    expect(
      applyPresenterAction(
        { ...moved, questionOpen: false },
        { ...open, slideSlug: "workflow" },
        12,
      ).questionOpenedAt,
    ).toBe(12);
  });
  it("rechaza slides inexistentes y preguntas inexistentes", () => {
    expect(() =>
      applyPresenterAction(session, { type: "navigate", slug: "missing" }, 2),
    ).toThrow("no existe");
    expect(() =>
      applyPresenterAction(
        { ...session, activeSlideSlug: "closing" },
        { type: "question", open: true, slideSlug: "closing" },
        2,
      ),
    ).toThrow("no tiene una pregunta");
  });
  it("terminar la sesión bloquea el control y los votos", () => {
    const ended = applyPresenterAction(
      { ...session, qrVisible: true },
      { type: "end" },
      2,
    );
    expect(ended.questionOpen).toBe(false);
    expect(ended.qrVisible).toBe(false);
    expect(() =>
      applyPresenterAction(ended, { type: "qr", visible: true }, 3),
    ).toThrow("ya terminó");
    expect(() =>
      applyPresenterAction(ended, { type: "theme", theme: "light" }, 3),
    ).toThrow("ya terminó");
    expect(() =>
      applyPresenterAction(ended, { type: "navigate", slug: "workflow" }, 3),
    ).toThrow("ya terminó");
    expect(() => validateVote(ended, "one", ["yes"])).toThrow("ya terminó");
  });
  it("rechaza controles de pregunta y resultados de una pestaña atrasada", () => {
    for (const open of [true, false])
      expect(() =>
        applyPresenterAction(
          session,
          { type: "question", open, slideSlug: "workflow" },
          2,
        ),
      ).toThrow("La presentación avanzó");
    for (const show of [true, false])
      expect(() =>
        applyPresenterAction(
          session,
          { type: "results", show, slideSlug: "workflow" },
          2,
        ),
      ).toThrow("La presentación avanzó");
  });
});

describe("identidad, capacidades y votos", () => {
  it("asigna el mismo avatar a la misma identidad", () => {
    expect(avatarFromToken("abc")).toEqual(avatarFromToken("abc"));
    expect(avatarFromToken("abc").name.split(" ")).toHaveLength(2);
  });
  it("los visitantes no obtienen el control del presentador", () => {
    expect(() =>
      requirePresenter(record, { participantToken: "token-one" }),
    ).toThrow("Solo el presentador");
    expect(() => requirePresenter(record, { presenterKey: "wrong" })).toThrow(
      "Solo el presentador",
    );
    expect(() =>
      requirePresenter(record, { presenterKey: "presenter-secret" }),
    ).not.toThrow();
  });
  it("comparte resultados en vivo sin revelar claves ni tokens", () => {
    const snapshot = publicSnapshot(record, { participantToken: "token-two" });
    expect(snapshot.participant?.id).toBe("two");
    expect(snapshot.isPresenter).toBe(false);
    expect(snapshot.votes).toEqual(record.votes);
    expect(snapshot.session?.showResults).toBe(true);
    expect(JSON.stringify(snapshot)).not.toMatch(
      /presenter-secret|token-one|token-two/,
    );
    expect(
      publicSnapshot(record, { participantToken: "token-one" }).votes,
    ).toHaveLength(1);
    expect(
      publicSnapshot(record, { presenterKey: "presenter-secret" }).votes,
    ).toHaveLength(1);
    expect(
      publicSnapshot(
        { ...record, session: { ...session, showResults: true } },
        {},
      ).votes,
    ).toHaveLength(1);
  });
  it("recupera respuestas existentes al volver a la pregunta sin exponer otras slides", () => {
    const closed = {
      ...record,
      session: { ...session, questionOpen: false, showResults: false },
    };
    expect(publicSnapshot(closed, {})).toMatchObject({
      session: { showResults: true },
      votes: record.votes,
    });
    const moved = {
      ...closed,
      session: { ...closed.session, activeSlideSlug: "workflow" },
    };
    expect(publicSnapshot(moved, {})).toMatchObject({
      session: { showResults: false },
      votes: [],
    });
    expect(
      publicSnapshot(moved, { participantToken: "token-one" }).votes,
    ).toEqual(record.votes);
  });
  it("solo cambia el voto de la identidad verificada", () => {
    const updated = recordVote(record, { participantToken: "token-two" }, [
      "no",
    ]);
    expect(updated.votes).toHaveLength(2);
    expect(
      updated.votes.find((vote) => vote.participantId === "one")?.optionIds,
    ).toEqual(["yes"]);
    const changed = recordVote(updated, { participantToken: "token-two" }, [
      "yes",
    ]);
    expect(changed.votes).toHaveLength(2);
    expect(
      changed.votes.find((vote) => vote.participantId === "two")?.optionIds,
    ).toEqual(["yes"]);
    expect(() =>
      recordVote(record, { participantToken: "unknown" }, ["no"]),
    ).toThrow("Únete");
  });
  it("rechaza opciones inexistentes, vacías, repetidas y selección múltiple en polls", () => {
    for (const options of [[], ["unknown"], ["yes", "yes"], ["yes", "no"]])
      expect(() => validateVote(session, "one", options)).toThrow();
    expect(validateVote(session, "one", ["yes"]).optionIds).toEqual(["yes"]);
    expect(() =>
      validateVote({ ...session, questionOpen: false }, "one", ["yes"]),
    ).toThrow("cerró las preguntas");
  });
  it("acepta varias opciones válidas únicamente en preguntas múltiples", () => {
    expect(
      validateVote({ ...session, activeSlideSlug: "workflow" }, "one", [
        "code",
        "review",
      ]).optionIds,
    ).toEqual(["code", "review"]);
  });
  it("acepta la pregunta de cualquier slide mientras las preguntas están abiertas", () => {
    expect(validateVote(session, "one", ["code"], "workflow")).toMatchObject({
      slideSlug: "workflow",
      optionIds: ["code"],
    });
    expect(() => validateVote(session, "one", ["yes"], "closing")).toThrow(
      "no tiene una pregunta",
    );
  });
});
