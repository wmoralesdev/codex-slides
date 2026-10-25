/// <reference types="vite/client" />
import { convexTest } from "convex-test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import schema from "./schema";
import { sessionsApi } from "../src/live/api";
import type { CreateSessionInput, PresenterAction } from "../src/live/types";

const modules = import.meta.glob("./**/*.{ts,js}");
const address = { namespace: "grok-bot-slides", sessionId: "a123456789abcdef" };
const presenterKey = "a".repeat(48);

beforeEach(() => {
  // The tests exercise the live sessions, which are closed after the event.
  vi.stubEnv("LIVE_SESSIONS_OPEN", "true");
});

afterEach(() => {
  vi.unstubAllEnvs();
});
const tokenOne = "b".repeat(48);
const tokenTwo = "c".repeat(48);
const manifest: CreateSessionInput = {
  deckSlug: "engineering",
  deckTitle: "Grok bot for Engineering",
  slides: [
    {
      slug: "welcome",
      title: "Hola",
      kicker: "01",
      guide: { intro: "Guía móvil" },
      question: {
        id: "used-grok",
        prompt: "¿Lo has usado?",
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
      guide: { intro: "El siguiente paso" },
      question: {
        id: "use-cases",
        prompt: "¿Para qué?",
        type: "multiple",
        options: [
          { id: "code", label: "Código" },
          { id: "review", label: "Reviews" },
        ],
      },
    },
  ],
};

async function setup() {
  const t = convexTest(schema, modules);
  await t.mutation(sessionsApi.create, {
    ...address,
    ...manifest,
    presenterKey,
  });
  return t;
}

describe("sesiones cerradas después del evento", () => {
  it("rechaza toda escritura sin LIVE_SESSIONS_OPEN y no pide contraseña", async () => {
    const t = await setup();
    vi.stubEnv("LIVE_SESSIONS_OPEN", undefined);
    const ended = { data: { code: "EVENT_ENDED" } };
    await expect(
      t.mutation(sessionsApi.authorizePresenter, { password: "x" }),
    ).rejects.toMatchObject(ended);
    await expect(
      t.mutation(sessionsApi.create, {
        ...address,
        sessionId: "b123456789abcdef",
        ...manifest,
        presenterKey,
      }),
    ).rejects.toMatchObject(ended);
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action: { type: "navigate", slug: "workflow" },
      }),
    ).rejects.toMatchObject(ended);
    await expect(
      t.mutation(sessionsApi.join, { ...address, participantToken: tokenOne }),
    ).rejects.toMatchObject(ended);
    await expect(
      t.mutation(sessionsApi.vote, {
        ...address,
        participantToken: tokenOne,
        slideSlug: "welcome",
        optionIds: ["yes"],
      }),
    ).rejects.toMatchObject(ended);
    const view = await t.query(sessionsApi.snapshot, address);
    expect(view.session?.activeSlideSlug).toBe("welcome");
    expect(view.participants).toHaveLength(0);
  });
});

describe("funciones de Convex con su esquema y base de datos", () => {
  it("crea una sesión y las queries nunca revelan capacidades privadas", async () => {
    const t = await setup();
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    const publicView = await t.query(sessionsApi.snapshot, address);
    expect(publicView.session).toMatchObject({
      id: address.sessionId,
      namespace: address.namespace,
      status: "live",
      activeSlideSlug: "welcome",
      questionOpen: true,
      qrVisible: false,
      projectionTheme: "dark",
    });
    expect(publicView.participants).toHaveLength(1);
    expect(publicView.participant).toBeNull();
    expect(publicView.isPresenter).toBe(false);
    expect(JSON.stringify(publicView)).not.toContain(presenterKey);
    expect(JSON.stringify(publicView)).not.toContain(tokenOne);
    expect(
      (await t.query(sessionsApi.snapshot, { ...address, presenterKey }))
        .isPresenter,
    ).toBe(true);
  });

  it("rechaza una capacidad ajena sin cambiar la sesión", async () => {
    const t = await setup();
    for (const action of [
      { type: "qr", visible: true } as const,
      { type: "theme", theme: "light" } as const,
    ]) {
      await expect(
        t.mutation(sessionsApi.update, {
          ...address,
          presenterKey: tokenOne,
          action,
        }),
      ).rejects.toThrow("Solo el presentador");
    }
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey: tokenOne,
        action: { type: "end" },
      }),
    ).rejects.toThrow("Solo el presentador");
    expect((await t.query(sessionsApi.snapshot, address)).session?.status).toBe(
      "live",
    );
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({ qrVisible: false, projectionTheme: "dark" });
  });

  it("sincroniza QR, tema y votos en vivo para la proyección pública", async () => {
    const t = await setup();
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: true, slideSlug: "welcome" },
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
      optionIds: ["yes"],
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "qr", visible: true },
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "theme", theme: "light" },
    });
    const projected = await t.query(sessionsApi.snapshot, address);
    expect(projected.session).toMatchObject({
      qrVisible: true,
      projectionTheme: "light",
      questionOpen: true,
      showResults: true,
    });
    expect(projected).toMatchObject({
      isPresenter: false,
      participant: null,
    });
    expect(projected.votes).toHaveLength(1);
    expect(projected.votes[0].optionIds).toEqual(["yes"]);
    expect(projected.participants).toHaveLength(1);
    expect(
      (await t.query(sessionsApi.snapshot, { ...address, presenterKey })).votes,
    ).toHaveLength(1);
    const openedAt = projected.session?.questionOpenedAt;
    expect(openedAt).toBeTypeOf("number");
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
      optionIds: ["no"],
    });
    const changed = await t.query(sessionsApi.snapshot, address);
    expect(changed.votes).toHaveLength(1);
    expect(changed.votes[0].optionIds).toEqual(["no"]);
    expect(changed.session?.questionOpenedAt).toBe(openedAt);
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: false, slideSlug: "welcome" },
    });
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(
      1,
    );
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "results", show: false, slideSlug: "welcome" },
    });
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(
      1,
    );

    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "navigate", slug: "workflow" },
    });
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({
      activeSlideSlug: "workflow",
      qrVisible: false,
      projectionTheme: "light",
      questionOpen: false,
      showResults: false,
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "navigate", slug: "welcome" },
    });
    expect(
      (await t.query(sessionsApi.snapshot, { ...address, presenterKey })).votes,
    ).toHaveLength(1);
    const returned = await t.query(sessionsApi.snapshot, address);
    expect(returned.votes).toHaveLength(1);
    expect(returned.session).toMatchObject({
      questionOpen: false,
      showResults: true,
      questionOpenedAt: openedAt,
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "qr", visible: true },
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "end" },
    });
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({ status: "ended", qrVisible: false });
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action: { type: "qr", visible: true },
      }),
    ).rejects.toThrow("ya terminó");
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action: { type: "theme", theme: "dark" },
      }),
    ).rejects.toThrow("ya terminó");
  });

  it("lee sesiones anteriores con defaults y permite controlar su proyección sin migrarlas", async () => {
    const t = convexTest(schema, modules);
    await t.run(async (ctx) => {
      await ctx.db.insert("sessions", {
        publicId: address.sessionId,
        namespace: address.namespace,
        presenterKey,
        ...manifest,
        activeSlideSlug: "welcome",
        questionOpen: false,
        showResults: false,
        status: "live",
        createdAt: 1,
        updatedAt: 1,
      });
    });
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({ qrVisible: false, projectionTheme: "dark" });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "qr", visible: true },
    });
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({ qrVisible: true, projectionTheme: "dark" });
  });

  it("muestra votos de sesiones anteriores abiertas o cerradas sin publicar ni migrar", async () => {
    const t = await setup();
    const rowId = await t.run(async (ctx) => {
      const row = await ctx.db
        .query("sessions")
        .withIndex("by_namespace_and_publicId", (q) =>
          q
            .eq("namespace", address.namespace)
            .eq("publicId", address.sessionId),
        )
        .unique();
      await ctx.db.patch("sessions", row!._id, {
        questionOpen: true,
        questionOpenedAt: undefined,
      });
      return row!._id;
    });
    const open = await t.query(sessionsApi.snapshot, address);
    expect(open.session).toMatchObject({
      questionOpen: true,
      showResults: true,
    });
    expect(open.session?.questionOpenedAt).toBeUndefined();
    expect(open.votes).toEqual([]);
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
      optionIds: ["yes"],
    });
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(1);
    await t.run((ctx) =>
      ctx.db.patch("sessions", rowId, { questionOpen: false }),
    );
    const closed = await t.query(sessionsApi.snapshot, address);
    expect(closed.session).toMatchObject({
      questionOpen: false,
      showResults: true,
    });
    expect(closed.votes).toHaveLength(1);
    const stored = await t.run((ctx) => ctx.db.get("sessions", rowId));
    expect(stored?.showResults).toBe(false);
  });

  it("identifica cada reapertura y conserva el identificador durante los demás controles", async () => {
    const t = await setup();
    const update = (action: PresenterAction) =>
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action,
      });
    await update({ type: "question", open: true, slideSlug: "welcome" });
    const first = (await t.query(sessionsApi.snapshot, address)).session!
      .questionOpenedAt!;
    expect(first).toBeTypeOf("number");
    for (const action of [
      { type: "question", open: true, slideSlug: "welcome" },
      { type: "qr", visible: true },
      { type: "theme", theme: "light" },
      { type: "question", open: false, slideSlug: "welcome" },
    ] as const) {
      await update(action);
      expect(
        (await t.query(sessionsApi.snapshot, address)).session?.questionOpenedAt,
      ).toBe(first);
    }
    await update({ type: "question", open: true, slideSlug: "welcome" });
    expect(
      (await t.query(sessionsApi.snapshot, address)).session!.questionOpenedAt!,
    ).toBeGreaterThan(first);
  });

  it("conserva la identidad y reemplaza solo el voto del participante verificado", async () => {
    const t = await setup();
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    const first = await t.query(sessionsApi.snapshot, {
      ...address,
      participantToken: tokenOne,
    });
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenTwo,
    });
    const rejoined = await t.query(sessionsApi.snapshot, {
      ...address,
      participantToken: tokenOne,
    });
    expect(rejoined.participant).toEqual(first.participant);
    expect(rejoined.participants).toHaveLength(2);
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: true, slideSlug: "welcome" },
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
      optionIds: ["yes"],
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenTwo,
      slideSlug: "welcome",
      optionIds: ["no"],
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenTwo,
      slideSlug: "welcome",
      optionIds: ["yes"],
    });
    const owner = await t.query(sessionsApi.snapshot, {
      ...address,
      presenterKey,
    });
    expect(owner.votes).toHaveLength(2);
    expect(owner.votes.every((vote) => vote.optionIds[0] === "yes")).toBe(true);
    const voter = await t.query(sessionsApi.snapshot, {
      ...address,
      participantToken: tokenTwo,
    });
    expect(voter.votes).toHaveLength(2);
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(
      2,
    );
    await expect(
      t.mutation(sessionsApi.vote, {
        ...address,
        participantToken: "d".repeat(48),
        slideSlug: "welcome",
        optionIds: ["no"],
      }),
    ).rejects.toThrow("Únete");
  });

  it("valida estado, opciones, preguntas cerradas y sesiones finalizadas en el servidor", async () => {
    const t = await setup();
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    const voteArgs = {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
    };
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: false, slideSlug: "welcome" },
    });
    await expect(
      t.mutation(sessionsApi.vote, { ...voteArgs, optionIds: ["yes"] }),
    ).rejects.toThrow("cerró las preguntas");
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: true, slideSlug: "welcome" },
    });
    for (const optionIds of [[], ["other"], ["yes", "yes"], ["yes", "no"]])
      await expect(
        t.mutation(sessionsApi.vote, { ...voteArgs, optionIds }),
      ).rejects.toThrow();
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "navigate", slug: "workflow" },
    });
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action: { type: "question", open: true, slideSlug: "welcome" },
      }),
    ).rejects.toThrow("La presentación avanzó");
    await expect(
      t.mutation(sessionsApi.update, {
        ...address,
        presenterKey,
        action: { type: "results", show: true, slideSlug: "welcome" },
      }),
    ).rejects.toThrow("La presentación avanzó");
    expect(
      (await t.query(sessionsApi.snapshot, address)).session,
    ).toMatchObject({ questionOpen: true });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: true, slideSlug: "workflow" },
    });
    // Questions on other slides keep taking answers while they are open.
    await t.mutation(sessionsApi.vote, { ...voteArgs, optionIds: ["yes"] });
    await t.mutation(sessionsApi.vote, {
      ...voteArgs,
      slideSlug: "workflow",
      optionIds: ["code", "review"],
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "end" },
    });
    await expect(
      t.mutation(sessionsApi.vote, {
        ...voteArgs,
        slideSlug: "workflow",
        optionIds: ["code"],
      }),
    ).rejects.toThrow("ya terminó");
    await expect(
      t.mutation(sessionsApi.join, { ...address, participantToken: tokenTwo }),
    ).rejects.toThrow("ya terminó");
  });

  it("muestra resultados automáticamente sin revelar respuestas de otras slides", async () => {
    const t = await setup();
    await t.mutation(sessionsApi.join, {
      ...address,
      participantToken: tokenOne,
    });
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "question", open: true, slideSlug: "welcome" },
    });
    await t.mutation(sessionsApi.vote, {
      ...address,
      participantToken: tokenOne,
      slideSlug: "welcome",
      optionIds: ["yes"],
    });
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(
      1,
    );
    await t.mutation(sessionsApi.update, {
      ...address,
      presenterKey,
      action: { type: "navigate", slug: "workflow" },
    });
    expect((await t.query(sessionsApi.snapshot, address)).votes).toHaveLength(
      0,
    );
    expect(
      (await t.query(sessionsApi.snapshot, { ...address, presenterKey })).votes,
    ).toHaveLength(0);
  });

  it("aísla namespaces y rechaza una colisión de sesión", async () => {
    const t = await setup();
    const otherAddress = { ...address, namespace: "otra-comunidad" };
    expect(
      (await t.query(sessionsApi.snapshot, otherAddress)).session,
    ).toBeNull();
    await t.mutation(sessionsApi.create, {
      ...otherAddress,
      ...manifest,
      presenterKey: tokenTwo,
    });
    expect(
      (await t.query(sessionsApi.snapshot, { ...otherAddress, presenterKey }))
        .isPresenter,
    ).toBe(false);
    await expect(
      t.mutation(sessionsApi.create, {
        ...address,
        ...manifest,
        presenterKey,
      }),
    ).rejects.toThrow("ya existe");
  });

  it("admite 500 participantes completos y rechaza nuevos ingresos sin truncar la sala", async () => {
    const t = await setup();
    await t.run(async (ctx) => {
      const session = await ctx.db
        .query("sessions")
        .withIndex("by_namespace_and_publicId", (q) =>
          q
            .eq("namespace", address.namespace)
            .eq("publicId", address.sessionId),
        )
        .unique();
      if (!session) throw new Error("Falta la sesión de prueba");
      for (let index = 0; index < 500; index++) {
        await ctx.db.insert("participants", {
          sessionId: session._id,
          token: index.toString(16).padStart(48, "0"),
          name: `Águila ${index}`,
          seed: index,
        });
      }
      await ctx.db.patch("sessions", session._id, { participantCount: 500 });
    });
    expect(
      (await t.query(sessionsApi.snapshot, address)).participants,
    ).toHaveLength(500);
    await expect(
      t.mutation(sessionsApi.join, { ...address, participantToken: tokenOne }),
    ).rejects.toThrow("máximo de 500");
    await expect(
      t.mutation(sessionsApi.join, {
        ...address,
        participantToken: "0".repeat(48),
      }),
    ).resolves.toBeNull();
  });
});
