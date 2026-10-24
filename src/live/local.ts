import {
  applyPresenterAction,
  avatarFromToken,
  resultsAreVisible,
  validateManifest,
  validateVote,
} from "./rules";
import {
  ensureParticipantToken,
  newSessionId,
  randomToken,
  readCredentials,
  readStorage,
  saveCredentials,
  storagePrefix,
  writeStorage,
} from "./credentials";
import { emptySnapshot } from "./types";
import { MAX_SESSION_PARTICIPANTS } from "./limits";
import type {
  Credentials,
  LiveTransport,
  Participant,
  Session,
  SessionSnapshot,
  Vote,
} from "./types";

export type LocalRecord = {
  session: Session;
  presenterKey: string;
  participants: (Participant & { token: string })[];
  votes: Vote[];
};

export function requirePresenter(
  record: LocalRecord,
  credentials: Credentials,
): void {
  if (
    !credentials.presenterKey ||
    record.presenterKey !== credentials.presenterKey
  )
    throw new Error("Solo el presentador puede controlar esta sesión.");
}

export function publicSnapshot(
  record: LocalRecord | null,
  credentials: Credentials,
): SessionSnapshot {
  if (!record) return emptySnapshot;
  const participant = record.participants.find(
    (person) => person.token === credentials.participantToken,
  );
  const isPresenter =
    !!credentials.presenterKey &&
    record.presenterKey === credentials.presenterKey;
  const publicPerson = ({ id, name, seed }: Participant): Participant => ({
    id,
    name,
    seed,
  });
  const showResults = resultsAreVisible(
    record.session,
    record.votes.some(
      (vote) => vote.slideSlug === record.session.activeSlideSlug,
    ),
  );
  return {
    session: {
      ...record.session,
      showResults,
      qrVisible: record.session.qrVisible ?? false,
      projectionTheme: record.session.projectionTheme ?? "dark",
    },
    participants: record.participants.map(publicPerson),
    votes: record.votes.filter(
      (vote) =>
        ((isPresenter || showResults) &&
          vote.slideSlug === record.session.activeSlideSlug) ||
        vote.participantId === participant?.id,
    ),
    participant: participant ? publicPerson(participant) : null,
    isPresenter,
  };
}

export function recordVote(
  record: LocalRecord,
  credentials: Credentials,
  optionIds: string[],
  slideSlug = record.session.activeSlideSlug,
): LocalRecord {
  const person = record.participants.find(
    (participant) => participant.token === credentials.participantToken,
  );
  if (!person) throw new Error("Únete a la sesión antes de responder.");
  const vote = validateVote(record.session, person.id, optionIds, slideSlug);
  return {
    ...record,
    votes: [
      ...record.votes.filter(
        (old) =>
          !(
            old.slideSlug === vote.slideSlug &&
            old.questionId === vote.questionId &&
            old.participantId === vote.participantId
          ),
      ),
      vote,
    ],
  };
}

export function createLocalTransport(
  namespace: string,
  configurationMessage = "No ha sido configurado Convex",
): LiveTransport {
  const subscribers = new Map<
    string,
    Set<{
      next: (snapshot: SessionSnapshot) => void;
      error: (error: Error) => void;
      publicOnly: boolean;
    }>
  >();
  const key = (id: string) => `${storagePrefix}:session:${namespace}:${id}`;
  const channel =
    typeof BroadcastChannel !== "undefined"
      ? new BroadcastChannel(`${storagePrefix}:${namespace}`)
      : null;
  const read = (id: string): LocalRecord | null => {
    const value = readStorage(key(id));
    if (!value) return null;
    try {
      return JSON.parse(value) as LocalRecord;
    } catch {
      throw new Error(
        "La sesión local está dañada. Crea una nueva presentación.",
      );
    }
  };
  const notify = (id: string) => {
    for (const subscriber of subscribers.get(id) ?? []) {
      try {
        subscriber.next(
          publicSnapshot(
            read(id),
            subscriber.publicOnly ? {} : readCredentials(namespace, id),
          ),
        );
      } catch (error) {
        subscriber.error(
          error instanceof Error
            ? error
            : new Error("No se pudo leer la sesión."),
        );
      }
    }
  };
  const write = (id: string, record: LocalRecord) => {
    writeStorage(key(id), JSON.stringify(record));
    notify(id);
    channel?.postMessage(id);
  };
  const transact = async (
    id: string,
    mutation: (record: LocalRecord) => LocalRecord,
  ) => {
    const run = () => {
      const record = read(id);
      if (!record)
        throw new Error(
          "No encontramos esta sesión. El modo local funciona en este navegador.",
        );
      write(id, mutation(record));
    };
    if (typeof navigator !== "undefined" && navigator.locks)
      await navigator.locks.request(key(id), async () => run());
    else run();
  };
  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key.startsWith(storagePrefix))
      for (const id of subscribers.keys()) notify(id);
  };
  const onCredentials = () => {
    for (const id of subscribers.keys()) notify(id);
  };
  channel?.addEventListener("message", (event) => {
    if (typeof event.data === "string") notify(event.data);
  });
  if (typeof window !== "undefined") {
    window.addEventListener("storage", onStorage);
    window.addEventListener("grok-credentials-changed", onCredentials);
  }

  return {
    mode: "local",
    configurationMessage,
    async authorizePresenter() {},
    hasPresenterAccess: () => true,
    async createSession(input) {
      validateManifest(input);
      let id = newSessionId();
      while (read(id)) id = newSessionId();
      const presenterKey = randomToken();
      const now = Date.now();
      const session: Session = {
        id,
        namespace,
        ...input,
        activeSlideSlug: input.slides[0].slug,
        questionOpen: true,
        questionOpenedAt: now,
        showResults: false,
        qrVisible: false,
        projectionTheme: "dark",
        status: "live",
        createdAt: now,
        updatedAt: now,
      };
      saveCredentials(namespace, id, { presenterKey });
      write(id, { session, presenterKey, participants: [], votes: [] });
      return id;
    },
    subscribe(id, next, error, options) {
      const subscriber = {
        next,
        error,
        publicOnly: options?.publicOnly ?? false,
      };
      if (!subscribers.has(id)) subscribers.set(id, new Set());
      subscribers.get(id)!.add(subscriber);
      notify(id);
      return () => {
        subscribers.get(id)?.delete(subscriber);
        if (!subscribers.get(id)?.size) subscribers.delete(id);
      };
    },
    async join(id) {
      const token = ensureParticipantToken(namespace, id);
      await transact(id, (record) => {
        if (record.session.status !== "live")
          throw new Error("Esta sesión ya terminó.");
        if (record.participants.some((person) => person.token === token))
          return record;
        if (record.participants.length >= MAX_SESSION_PARTICIPANTS)
          throw new Error("Esta sesión llegó al máximo de 500 participantes.");
        const person = {
          ...avatarFromToken(token),
          id: `guest-${newSessionId()}`,
          token,
        };
        return { ...record, participants: [...record.participants, person] };
      });
    },
    async update(id, action) {
      await transact(id, (record) => {
        requirePresenter(record, readCredentials(namespace, id));
        return {
          ...record,
          session: applyPresenterAction(record.session, action, Date.now()),
        };
      });
    },
    async vote(id, optionIds, slideSlug) {
      await transact(id, (record) =>
        recordVote(
          record,
          readCredentials(namespace, id),
          optionIds,
          slideSlug,
        ),
      );
    },
    close() {
      channel?.close();
      subscribers.clear();
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", onStorage);
        window.removeEventListener("grok-credentials-changed", onCredentials);
      }
    },
  };
}
