import { describe, expect, it } from "vitest";
import { decks } from ".";
import { talkDecks } from "./talks";
import { MAX_DECK_SLIDES } from "../live/limits";

describe("DevDay decks", () => {
  it("opens with the event deck followed by the six talks", () => {
    expect(decks[0].slug).toBe("devday-exchange-san-salvador");
    expect(talkDecks).toHaveLength(6);
    expect(new Set(talkDecks.map((deck) => deck.speaker?.id)).size).toBe(6);
  });

  it("keeps deck slugs, slide slugs and question ids unique", () => {
    expect(new Set(decks.map((deck) => deck.slug)).size).toBe(decks.length);
    // The event deck replays every talk, so its question ids repeat theirs on
    // purpose; votes are per session. Across the talks, and inside each deck,
    // they stay unique.
    const questionIdsOf = (list: typeof decks) =>
      list.flatMap((deck) => deck.slides.flatMap((slide) => (slide.question ? [slide.question.id] : [])));
    const talkQuestionIds = questionIdsOf(talkDecks);
    expect(new Set(talkQuestionIds).size).toBe(talkQuestionIds.length);
    for (const deck of decks) {
      const slugs = deck.slides.map((slide) => slide.slug);
      expect(new Set(slugs).size, deck.slug).toBe(slugs.length);
      const questionIds = questionIdsOf([deck]);
      expect(new Set(questionIds).size, deck.slug).toBe(questionIds.length);
    }
  });

  it("runs the opening, then every talk in agenda order after its demo pause", () => {
    const event = decks[0];
    // Each demo is a title slide plus its video (pausa-<talk>-2…); the first keeps the plain slug.
    const extraPause = /^pausa-.+-\d+$/;
    const talkSlugs = talkDecks.flatMap((deck) => [
      `pausa-${deck.slug}`,
      ...deck.slides.filter((slide) => slide.slug !== "espera").map((slide) => `${deck.slug}-${slide.slug}`),
    ]);
    const opening = ["espera", "anuncios", "agenda"];
    const slugs = event.slides.map((slide) => slide.slug);
    expect(slugs.filter((slug) => !extraPause.test(slug))).toEqual([...opening, ...talkSlugs]);
    expect(slugs).toContain("pausa-codex-en-la-nube-4");
    expect(event.slides.length).toBeLessThanOrEqual(MAX_DECK_SLIDES);
  });

  it("starts shared-structure decks with the 00 cover and ends their talks with questions", () => {
    // decisions-api is built slide-by-slide from Frank's PPTX (12 slides, no
    // shared cover/brief/questions), so it opts out of the defineTalk shape.
    const sharedDecks = decks.filter((deck) => deck.slug !== "decisions-api");
    const sharedTalkDecks = talkDecks.filter((deck) => deck.slug !== "decisions-api");
    for (const deck of sharedDecks) {
      expect(deck.firstSlideNumber).toBe(0);
      expect(deck.slides[0].slug).toBe("espera");
      expect(deck.slides[0].question).toBeUndefined();
    }
    for (const deck of sharedTalkDecks) {
      expect(deck.slides.at(-1)?.slug).toBe("preguntas");
    }
  });
});
