import { ConvexError, v } from "convex/values";
import type { Infer } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { MAX_DECK_SLIDES, MAX_SESSION_PARTICIPANTS } from "../src/live/limits";
import {
  presenterActionValidator,
  slideValidator,
  snapshotValidator,
} from "./validators";
import {
  applyPresenterAction,
  avatarFromToken,
  resultsAreVisible,
  validateManifest,
  validateVote,
} from "../src/live/rules";
import type { Session } from "../src/live/types";

const addressArgs = { namespace: v.string(), sessionId: v.string() };
const MAX_PRESENTER_PASSWORD_LENGTH = 1024;

function requirePresenterPassword(password: string | undefined): void {
  const expected = process.env.PRESENTER_PASSWORD;
  if (
    !expected ||
    !expected.trim() ||
    expected.length > MAX_PRESENTER_PASSWORD_LENGTH
  ) {
    throw new ConvexError({
      code: "PRESENTER_PASSWORD_NOT_CONFIGURED",
      message: "Falta configurar la contraseña del presentador en el servidor.",
    });
  }
  if (!password) {
    throw new ConvexError({
      code: "PRESENTER_PASSWORD_REQUIRED",
      message: "Ingresá la contraseña para controlar la presentación.",
    });
  }
  if (password.length > MAX_PRESENTER_PASSWORD_LENGTH) {
    throw new ConvexError({
      code: "PRESENTER_PASSWORD_INVALID",
      message: "La contraseña del presentador no es correcta.",
    });
  }

  let difference = expected.length ^ password.length;
  for (let index = 0; index < expected.length; index++) {
    difference |=
      expected.charCodeAt(index) ^ (password.charCodeAt(index) || 0);
  }
  if (difference !== 0) {
    throw new ConvexError({
      code: "PRESENTER_PASSWORD_INVALID",
      message: "La contraseña del presentador no es correcta.",
    });
  }
}

function publicRule<T>(run: () => T): T {
  try {
    return run();
  } catch (error) {
    throw new ConvexError(
      error instanceof Error
        ? error.message
        : "No pudimos validar esta acción.",
    );
  }
}

function validateAddress(namespace: string, sessionId: string): void {
  if (!/^[a-z0-9][a-z0-9-]{0,79}$/.test(namespace))
    throw new ConvexError(
      "El workspace necesita un slug válido de hasta 80 caracteres.",
    );
  if (!/^[a-f0-9]{16}$/.test(sessionId))
    throw new ConvexError("El identificador de la sesión no es válido.");
}

function validateToken(token: string): void {
  if (!/^[a-f0-9]{48}$/.test(token))
    throw new ConvexError("La credencial de la sesión no es válida.");
}

async function findSession(
  ctx: QueryCtx | MutationCtx,
  namespace: string,
  publicId: string,
) {
  validateAddress(namespace, publicId);
  return ctx.db
    .query("sessions")
    .withIndex("by_namespace_and_publicId", (q) =>
      q.eq("namespace", namespace).eq("publicId", publicId),
    )
    .unique();
}

async function requireSession(
  ctx: QueryCtx | MutationCtx,
  namespace: string,
  publicId: string,
) {
  const session = await findSession(ctx, namespace, publicId);
  if (!session) throw new ConvexError("No encontramos esta sesión.");
  return session;
}

function publicSession(row: Doc<"sessions">): Session {
  return {
    id: row.publicId,
    namespace: row.namespace,
    deckSlug: row.deckSlug,
    deckTitle: row.deckTitle,
    slides: row.slides,
    activeSlideSlug: row.activeSlideSlug,
    questionOpen: row.questionOpen,
    ...(row.questionOpenedAt !== undefined
      ? { questionOpenedAt: row.questionOpenedAt }
      : {}),
    showResults: row.showResults,
    qrVisible: row.qrVisible ?? false,
    projectionTheme: row.projectionTheme ?? "dark",
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export const authorizePresenter = mutation({
  args: { password: v.string() },
  returns: v.null(),
  handler: (_ctx, args): null => {
    requirePresenterPassword(args.password);
    return null;
  },
});

export const create = mutation({
  returns: v.string(),
  args: {
    ...addressArgs,
    presenterKey: v.string(),
    presenterPassword: v.optional(v.string()),
    deckSlug: v.string(),
    deckTitle: v.string(),
    slides: v.array(slideValidator),
  },
  handler: async (ctx, args): Promise<string> => {
    requirePresenterPassword(args.presenterPassword);
    validateAddress(args.namespace, args.sessionId);
    validateToken(args.presenterKey);
    publicRule(() => validateManifest(args));
    if (await findSession(ctx, args.namespace, args.sessionId))
      throw new ConvexError("Esta sesión ya existe. Intenta nuevamente.");
    const now = Date.now();
    await ctx.db.insert("sessions", {
      publicId: args.sessionId,
      namespace: args.namespace,
      presenterKey: args.presenterKey,
      deckSlug: args.deckSlug,
      deckTitle: args.deckTitle,
      slides: args.slides,
      activeSlideSlug: args.slides[0].slug,
      questionOpen: true,
      questionOpenedAt: now,
      showResults: false,
      qrVisible: false,
      projectionTheme: "dark",
      status: "live",
      createdAt: now,
      updatedAt: now,
      participantCount: 0,
    });
    return args.sessionId;
  },
});

export const snapshot = query({
  returns: snapshotValidator,
  args: {
    ...addressArgs,
    presenterKey: v.optional(v.string()),
    participantToken: v.optional(v.string()),
  },
  handler: async (ctx, args): Promise<Infer<typeof snapshotValidator>> => {
    const row = await findSession(ctx, args.namespace, args.sessionId);
    if (!row)
      return {
        session: null,
        participants: [],
        votes: [],
        participant: null,
        isPresenter: false,
      };
    const people = await ctx.db
      .query("participants")
      .withIndex("by_sessionId", (q) => q.eq("sessionId", row._id))
      .take(MAX_SESSION_PARTICIPANTS + 1);
    if (people.length > MAX_SESSION_PARTICIPANTS)
      throw new ConvexError(
        "Esta sesión supera el límite de 500 participantes. Crea una nueva sesión.",
      );
    const participantRow = args.participantToken
      ? await ctx.db
          .query("participants")
          .withIndex("by_sessionId_and_token", (q) =>
            q.eq("sessionId", row._id).eq("token", args.participantToken!),
          )
          .unique()
      : null;
    const publicPerson = (person: Doc<"participants">) => ({
      id: person._id,
      name: person.name,
      seed: person.seed,
    });
    const isPresenter =
      !!args.presenterKey && args.presenterKey === row.presenterKey;
    const currentVotes = await ctx.db
      .query("votes")
      .withIndex("by_sessionId_and_slideSlug", (q) =>
        q.eq("sessionId", row._id).eq("slideSlug", row.activeSlideSlug),
      )
      .take(MAX_SESSION_PARTICIPANTS + 1);
    if (currentVotes.length > MAX_SESSION_PARTICIPANTS)
      throw new ConvexError(
        "Los resultados de esta sesión superan el límite permitido.",
      );
    const ownVotes = participantRow
      ? await ctx.db
          .query("votes")
          .withIndex("by_participantId_and_slideSlug", (q) =>
            q.eq("participantId", participantRow._id),
          )
          .take(MAX_DECK_SLIDES + 1)
      : [];
    if (ownVotes.length > MAX_DECK_SLIDES)
      throw new ConvexError("La sesión supera el límite de 100 slides.");
    const visibleVotes = [
      ...new Map(
        [...currentVotes, ...ownVotes].map((vote) => [vote._id, vote]),
      ).values(),
    ];
    const session = publicSession(row);
    return {
      session: {
        ...session,
        showResults: resultsAreVisible(session, currentVotes.length > 0),
      },
      participants: people.map(publicPerson),
      participant: participantRow ? publicPerson(participantRow) : null,
      isPresenter,
      votes: visibleVotes.map(
        ({ participantId, questionId, slideSlug, optionIds }) => ({
          participantId,
          questionId,
          slideSlug,
          optionIds,
        }),
      ),
    };
  },
});

export const join = mutation({
  returns: v.null(),
  args: { ...addressArgs, participantToken: v.string() },
  handler: async (ctx, args): Promise<null> => {
    validateToken(args.participantToken);
    const session = await requireSession(ctx, args.namespace, args.sessionId);
    if (session.status !== "live")
      throw new ConvexError("Esta sesión ya terminó.");
    const existing = await ctx.db
      .query("participants")
      .withIndex("by_sessionId_and_token", (q) =>
        q.eq("sessionId", session._id).eq("token", args.participantToken),
      )
      .unique();
    if (existing) return null;
    const participantCount =
      session.participantCount ??
      (
        await ctx.db
          .query("participants")
          .withIndex("by_sessionId", (q) => q.eq("sessionId", session._id))
          .take(MAX_SESSION_PARTICIPANTS + 1)
      ).length;
    if (participantCount >= MAX_SESSION_PARTICIPANTS)
      throw new ConvexError(
        "Esta sesión llegó al máximo de 500 participantes.",
      );
    const { name, seed } = avatarFromToken(args.participantToken);
    await ctx.db.insert("participants", {
      sessionId: session._id,
      token: args.participantToken,
      name,
      seed,
    });
    await ctx.db.patch("sessions", session._id, {
      participantCount: participantCount + 1,
    });
    return null;
  },
});

export const update = mutation({
  returns: v.null(),
  args: {
    ...addressArgs,
    presenterKey: v.string(),
    presenterPassword: v.optional(v.string()),
    action: presenterActionValidator,
  },
  handler: async (ctx, args): Promise<null> => {
    requirePresenterPassword(args.presenterPassword);
    const row = await requireSession(ctx, args.namespace, args.sessionId);
    if (!args.presenterKey || row.presenterKey !== args.presenterKey)
      throw new ConvexError("Solo el presentador puede controlar esta sesión.");
    const changed = publicRule(() =>
      applyPresenterAction(publicSession(row), args.action, Date.now()),
    );
    await ctx.db.patch("sessions", row._id, {
      activeSlideSlug: changed.activeSlideSlug,
      questionOpen: changed.questionOpen,
      ...(changed.questionOpenedAt !== undefined
        ? { questionOpenedAt: changed.questionOpenedAt }
        : {}),
      showResults: changed.showResults,
      qrVisible: changed.qrVisible ?? false,
      projectionTheme: changed.projectionTheme ?? "dark",
      status: changed.status,
      updatedAt: changed.updatedAt,
    });
    return null;
  },
});

export const vote = mutation({
  returns: v.null(),
  args: {
    ...addressArgs,
    participantToken: v.string(),
    slideSlug: v.string(),
    optionIds: v.array(v.string()),
  },
  handler: async (ctx, args): Promise<null> => {
    const session = await requireSession(ctx, args.namespace, args.sessionId);
    const participant = await ctx.db
      .query("participants")
      .withIndex("by_sessionId_and_token", (q) =>
        q.eq("sessionId", session._id).eq("token", args.participantToken),
      )
      .unique();
    if (!participant)
      throw new ConvexError("Únete a la sesión antes de responder.");
    const answer = publicRule(() =>
      validateVote(
        publicSession(session),
        participant._id,
        args.optionIds,
        args.slideSlug,
      ),
    );
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_participantId_and_slideSlug", (q) =>
        q
          .eq("participantId", participant._id)
          .eq("slideSlug", answer.slideSlug),
      )
      .unique();
    if (existing)
      await ctx.db.patch("votes", existing._id, {
        questionId: answer.questionId,
        optionIds: answer.optionIds,
      });
    else
      await ctx.db.insert("votes", {
        sessionId: session._id,
        ...answer,
        participantId: participant._id,
      });
    return null;
  },
});
