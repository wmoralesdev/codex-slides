import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  ArrowRight,
  MagnifyingGlass,
  Stack,
  Clock,
  Broadcast,
} from "@phosphor-icons/react";
import { decks, type Deck } from "../decks";
import { ShellHeader, ConnectionNotice } from "../components/Shell";
import { Face } from "../devday/Face";
import { AiLabsLogo, OpenAIWordmark } from "../devday/Brand";
import { DEVDAY_EVENT } from "../devday/event";
import { FACE_PALETTE, FACE_PRESETS } from "../devday/faces";

const [eventDeck, ...talks] = decks;

/** The talk's own cover (slide 01): slide 00 is the same holding screen for every deck. */
function talkCover(deck: Deck) {
  return (deck.slides[1] ?? deck.slides[0]).component;
}

function draftCount(deck: Deck) {
  return deck.slides.filter((slide) => slide.draft).length;
}

export function Library() {
  const [search, setSearch] = useState("");
  const query = search.trim().toLowerCase();
  const filtered = talks.filter((deck) =>
    `${deck.title} ${deck.category} ${deck.speaker?.name ?? ""}`
      .toLowerCase()
      .includes(query),
  );
  const EventCover = eventDeck.slides[0].component;
  return (
    <div className="app-shell">
      <ShellHeader />
      <main className="library-main">
        <section className="library-hero" aria-labelledby="library-title">
          <div className="library-hero-text">
            <ul className="library-facts">
              <li>{DEVDAY_EVENT.date}</li>
              <li>{DEVDAY_EVENT.venue}</li>
              <li>{DEVDAY_EVENT.city}</li>
            </ul>
            <h1 id="library-title">
              Las slides de
              <br />
              DevDay Exchange.
            </h1>
            <p className="library-lead">
              La apertura y las seis charlas del evento. Cada speaker arma su
              contenido sobre la misma base: portada, guía en el teléfono y
              encuestas en vivo.
            </p>
            <div className="library-actions">
              <Link
                className="button primary large"
                to="/deck/$deckSlug"
                params={{ deckSlug: eventDeck.slug }}
                search={{ slide: undefined }}
              >
                Abrir la apertura <ArrowUpRight size={18} />
              </Link>
              <a className="button secondary large" href="#agenda">
                Ver la agenda <ArrowRight size={18} />
              </a>
            </div>
          </div>
          <div className="library-hero-visual">
            <Link
              to="/deck/$deckSlug"
              params={{ deckSlug: eventDeck.slug }}
              search={{ slide: undefined }}
              className="library-hero-cover"
              aria-label={`Abrir ${eventDeck.title}`}
            >
              <div className="slide-stage">
                <EventCover />
              </div>
            </Link>
            <span className="library-hero-note">
              <Broadcast size={16} /> Apertura · {eventDeck.slides.length - 1}{" "}
              slides · {eventDeck.duration}
            </span>
          </div>
        </section>

        <section id="agenda" className="library-agenda" aria-labelledby="agenda-title">
          <div className="library-heading">
            <div>
              <h2 id="agenda-title">La agenda</h2>
              <p>
                Seis charlas alrededor de lo que anunció OpenAI en DevDay 2026.
                Los títulos de cada slide ya están; el contenido lo arma cada speaker.
              </p>
            </div>
            <label className="search-field">
              <MagnifyingGlass size={18} />
              <input
                aria-label="Buscar charlas"
                placeholder="Buscar por tema o speaker…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button aria-label="Limpiar búsqueda" onClick={() => setSearch("")}>
                  ×
                </button>
              )}
            </label>
          </div>

          {filtered.length > 0 ? (
            <ol className="talk-grid">
              {filtered.map((deck) => {
                const Cover = talkCover(deck);
                const drafts = draftCount(deck);
                const total = deck.slides.length - 1;
                const order = talks.indexOf(deck) + 1;
                return (
                  <li className="talk-card" key={deck.slug}>
                    <Link
                      to="/deck/$deckSlug"
                      params={{ deckSlug: deck.slug }}
                      search={{ slide: undefined }}
                      className="talk-cover"
                      aria-label={`Abrir ${deck.title}`}
                    >
                      <div className="slide-stage">
                        <Cover />
                      </div>
                      <span className="talk-order">{String(order).padStart(2, "0")}</span>
                    </Link>
                    <div className="talk-meta">
                      <div className="talk-speaker">
                        {deck.speaker && (
                          <span className="talk-face" aria-hidden="true">
                            <Face config={deck.speaker.face} />
                          </span>
                        )}
                        <span>
                          <strong>{deck.speaker?.name}</strong>
                          <span>{deck.category}</span>
                        </span>
                      </div>
                      <h3>{deck.title}</h3>
                      <div className="talk-progress" aria-label={`${total - drafts} de ${total} slides con contenido`}>
                        <span className="talk-progress-bar">
                          <span style={{ width: `${((total - drafts) / total) * 100}%` }} />
                        </span>
                        <span>
                          {drafts > 0 ? `${drafts} de ${total} slides por armar` : "Contenido completo"}
                        </span>
                      </div>
                      <div className="talk-footer">
                        <span className="deck-facts">
                          <span><Stack size={15} />{total} slides</span>
                          <span><Clock size={15} />{deck.duration}</span>
                        </span>
                        <Link
                          className="button subtle"
                          to="/slides/$deckSlug"
                          params={{ deckSlug: deck.slug }}
                          search={{ slide: undefined }}
                          aria-label={`Ver slides de ${deck.title}`}
                        >
                          Ver slides <ArrowRight size={16} />
                        </Link>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="search-empty">
              <Face config={{ ...FACE_PRESETS.curious, color: FACE_PALETTE.purple }} className="search-empty-face" />
              <h3>No encontramos esa charla.</h3>
              <p>Probá con Sol, Higgsfield, Codex, Notion o el nombre de un speaker.</p>
              <button className="button secondary" onClick={() => setSearch("")}>
                Ver toda la agenda
              </button>
            </div>
          )}
        </section>
        <ConnectionNotice />
      </main>
      <footer className="library-footer dd-on-dark">
        <div>
          <span className="library-footer-brands">
            <OpenAIWordmark className="library-footer-openai" />
            <span className="library-footer-rule" aria-hidden="true" />
            <span>Organiza</span>
            <AiLabsLogo className="library-footer-ailabs" />
          </span>
          <span className="library-footer-tag">
            {DEVDAY_EVENT.hashtag} · {DEVDAY_EVENT.dateLong}
          </span>
        </div>
      </footer>
    </div>
  );
}
