import { afterEach, describe, expect, it } from "vitest";
import { createLocalTransport } from "./local";
import { readCredentials, saveCredentials } from "./credentials";
import type {
  CreateSessionInput,
  LiveTransport,
  SessionSnapshot,
} from "./types";

const transports: LiveTransport[] = [];
afterEach(() => {
  for (const transport of transports.splice(0)) transport.close?.();
});

const input: CreateSessionInput = {
  deckSlug: "demo",
  deckTitle: "Demo",
  slides: [
    {
      slug: "first",
      title: "Primera",
      kicker: "01",
      guide: { intro: "Guía" },
      question: {
        id: "q1",
        prompt: "¿Sí o no?",
        type: "single",
        options: [
          { id: "yes", label: "Sí" },
          { id: "no", label: "No" },
        ],
      },
    },
    {
      slug: "second",
      title: "Segunda",
      kicker: "02",
      guide: { intro: "Más contexto" },
    },
  ],
};

function setup() {
  const namespace = `test-${crypto.randomUUID()}`;
  const transport = createLocalTransport(namespace);
  transports.push(transport);
  return { namespace, transport };
}

describe("transporte local", () => {
  it("atribuye cada voto a la pregunta de su slide aunque las opciones se repitan", async () => {
    const { transport } = setup();
    const repeatedOptions = structuredClone(input);
    repeatedOptions.slides[1].question = {
      ...structuredClone(input.slides[0].question!),
      id: "q2",
      prompt: "¿Otra pregunta con Sí y No?",
    };
    const id = await transport.createSession(repeatedOptions);
    let current!: SessionSnapshot;
    const unsubscribe = transport.subscribe(
      id,
      (value) => {
        current = value;
      },
      (error) => {
        throw error;
      },
    );
    await transport.join(id);

    // Every question opens with the session: a reader ahead of the presenter can answer.
    await transport.vote(id, ["yes"], "second");
    await transport.vote(id, ["yes"], "first");
    expect(current.votes).toHaveLength(2);

    await transport.update(id, { type: "navigate", slug: "second" });
    // Each vote stays with its own slide's question even when the options match.
    await transport.vote(id, ["no"], "second");
    expect(current.votes).toHaveLength(2);
    expect(current.votes.find((v) => v.slideSlug === "first")).toMatchObject({
      questionId: "q1",
      optionIds: ["yes"],
    });
    expect(current.votes.find((v) => v.slideSlug === "second")).toMatchObject({
      questionId: "q2",
      optionIds: ["no"],
    });
    await transport.update(id, {
      type: "question",
      open: false,
      slideSlug: "second",
    });
    await expect(transport.vote(id, ["yes"], "first")).rejects.toThrow(
      "cerró las preguntas",
    );
    unsubscribe();
  });

  it("permite crear, entrar, responder, avanzar y terminar sin Convex", async () => {
    const { transport } = setup();
    expect(transport.mode).toBe("local");
    expect(transport.configurationMessage).toBe(
      "No ha sido configurado Convex",
    );
    const id = await transport.createSession(input);
    let current!: SessionSnapshot;
    const unsubscribe = transport.subscribe(
      id,
      (value) => {
        current = value;
      },
      (error) => {
        throw error;
      },
    );
    expect(current.isPresenter).toBe(true);
    expect(current.session?.activeSlideSlug).toBe("first");
    await transport.join(id);
    const avatar = current.participant;
    await transport.join(id);
    expect(current.participant).toEqual(avatar);
    expect(current.participants).toHaveLength(1);
    expect(current.session?.questionOpen).toBe(true);
    await transport.vote(id, ["yes"], "first");
    await transport.vote(id, ["no"], "first");
    expect(current.votes).toHaveLength(1);
    expect(current.votes[0].optionIds).toEqual(["no"]);
    await transport.update(id, { type: "navigate", slug: "second" });
    expect(current.session?.activeSlideSlug).toBe("second");
    expect(current.session?.questionOpen).toBe(true);
    await expect(
      transport.update(id, {
        type: "question",
        open: true,
        slideSlug: "first",
      }),
    ).rejects.toThrow("La presentación avanzó");
    await expect(
      transport.update(id, { type: "results", show: true, slideSlug: "first" }),
    ).rejects.toThrow("La presentación avanzó");
    expect(current.session?.questionOpen).toBe(true);
    await transport.update(id, { type: "end" });
    await expect(transport.join(id)).rejects.toThrow("ya terminó");
    await expect(transport.vote(id, ["yes"], "first")).rejects.toThrow(
      "ya terminó",
    );
    unsubscribe();
  });

  it("comprueba la capacidad al ejecutar cada acción de presentación", async () => {
    const { namespace, transport } = setup();
    const id = await transport.createSession(input);
    const owner = readCredentials(namespace, id);
    saveCredentials(namespace, id, {});
    await expect(
      transport.update(id, { type: "qr", visible: true }),
    ).rejects.toThrow("Solo el presentador");
    await expect(
      transport.update(id, { type: "theme", theme: "light" }),
    ).rejects.toThrow("Solo el presentador");
    await expect(transport.update(id, { type: "end" })).rejects.toThrow(
      "Solo el presentador",
    );
    saveCredentials(namespace, id, owner);
    await expect(
      transport.update(id, { type: "end" }),
    ).resolves.toBeUndefined();
  });

  it("sincroniza otra instancia y restaura la sesión guardada", async () => {
    const { namespace, transport } = setup();
    const id = await transport.createSession(input);
    await transport.update(id, { type: "qr", visible: true });
    await transport.update(id, { type: "theme", theme: "light" });
    const other = createLocalTransport(namespace);
    transports.push(other);
    let current!: SessionSnapshot;
    const unsubscribe = other.subscribe(
      id,
      (value) => {
        current = value;
      },
      (error) => {
        throw error;
      },
    );
    expect(current.session?.deckTitle).toBe("Demo");
    expect(current.session).toMatchObject({
      qrVisible: true,
      projectionTheme: "light",
    });
    await transport.update(id, { type: "navigate", slug: "second" });
    await expect.poll(() => current.session?.activeSlideSlug).toBe("second");
    expect(current.session).toMatchObject({
      qrVisible: false,
      projectionTheme: "light",
    });
    unsubscribe();
  });

  it("la proyección recibe votos en vivo y conserva los resultados al cerrar y volver", async () => {
    const { namespace, transport } = setup();
    const id = await transport.createSession(input);
    await transport.join(id);
    await transport.update(id, {
      type: "question",
      open: true,
      slideSlug: "first",
    });
    await transport.vote(id, ["yes"], "first");
    let projection!: SessionSnapshot;
    let moderator!: SessionSnapshot;
    const onError = (error: Error) => {
      throw error;
    };
    const stopModerator = transport.subscribe(
      id,
      (value) => {
        moderator = value;
      },
      onError,
    );
    const stopProjection = transport.subscribe(
      id,
      (value) => {
        projection = value;
      },
      onError,
      { publicOnly: true },
    );
    const credentials = readCredentials(namespace, id);
    expect(credentials.presenterKey).toBeTruthy();
    expect(credentials.participantToken).toBeTruthy();
    expect(moderator.isPresenter).toBe(true);
    expect(moderator.votes).toHaveLength(1);
    expect(projection).toMatchObject({
      isPresenter: false,
      participant: null,
      session: { showResults: true },
    });
    expect(projection.votes).toHaveLength(1);
    expect(projection.votes[0].optionIds).toEqual(["yes"]);
    expect(projection.participants).toHaveLength(1);
    expect(JSON.stringify(projection)).not.toContain(credentials.presenterKey);
    expect(JSON.stringify(projection)).not.toContain(
      credentials.participantToken,
    );

    const openedAt = projection.session?.questionOpenedAt;
    expect(openedAt).toBeTypeOf("number");
    await transport.vote(id, ["no"], "first");
    expect(projection.votes).toHaveLength(1);
    expect(projection.votes[0].optionIds).toEqual(["no"]);
    expect(projection.session?.questionOpenedAt).toBe(openedAt);
    await transport.update(id, {
      type: "question",
      open: false,
      slideSlug: "first",
    });
    expect(projection.votes).toHaveLength(1);
    await transport.update(id, {
      type: "results",
      show: false,
      slideSlug: "first",
    });
    expect(projection.votes).toHaveLength(1);
    expect(moderator.votes).toHaveLength(1);
    await transport.update(id, { type: "qr", visible: true });
    await transport.update(id, { type: "theme", theme: "light" });
    stopProjection();
    const reopened = createLocalTransport(namespace);
    transports.push(reopened);
    const stopReopened = reopened.subscribe(
      id,
      (value) => {
        projection = value;
      },
      onError,
      { publicOnly: true },
    );
    expect(projection.session).toMatchObject({
      activeSlideSlug: "first",
      qrVisible: true,
      projectionTheme: "light",
    });
    expect(projection).toMatchObject({
      isPresenter: false,
      participant: null,
      session: { showResults: true, questionOpenedAt: openedAt },
    });
    expect(projection.votes).toHaveLength(1);
    await transport.update(id, { type: "navigate", slug: "second" });
    await expect.poll(() => projection.session?.activeSlideSlug).toBe("second");
    expect(projection.session).toMatchObject({
      questionOpen: false,
      showResults: false,
      qrVisible: false,
    });
    await transport.update(id, { type: "navigate", slug: "first" });
    expect(moderator.votes).toHaveLength(1);
    await expect.poll(() => projection.votes.length).toBe(1);
    expect(projection.session).toMatchObject({
      questionOpen: false,
      showResults: true,
    });
    await transport.update(id, {
      type: "question",
      open: true,
      slideSlug: "first",
    });
    await expect.poll(() => projection.session?.questionOpen).toBe(true);
    expect(projection.session!.questionOpenedAt!).toBeGreaterThan(openedAt!);
    await transport.update(id, { type: "qr", visible: true });
    await transport.update(id, { type: "end" });
    await expect.poll(() => projection.session?.status).toBe("ended");
    expect(projection.session?.qrVisible).toBe(false);
    stopModerator();
    stopReopened();
  });

  it("separa namespaces y devuelve una sesión ausente sin fallar", async () => {
    const { transport } = setup();
    const id = await transport.createSession(input);
    const { transport: other } = setup();
    let current!: SessionSnapshot;
    const unsubscribe = other.subscribe(
      id,
      (value) => {
        current = value;
      },
      (error) => {
        throw error;
      },
    );
    expect(current.session).toBeNull();
    await expect(other.join(id)).rejects.toThrow("No encontramos");
    unsubscribe();
  });
});
