import {
  Broadcast,
  Clock,
  NoteBlank,
  Play,
  Stop,
} from "@phosphor-icons/react";
import type { SlideDefinition } from "../../decks";
import type { Vote } from "../../live/types";
import { QuestionResults } from "../QuestionResults";

type PresenterDetailsProps = {
  slide: SlideDefinition;
  standalone?: boolean;
  isLive: boolean;
  busy: boolean;
  ended: boolean;
  votingOpen: boolean;
  votes: Vote[];
  onQuestionOpen: (open: boolean) => void;
};

export function PresenterDetails(props: PresenterDetailsProps) {
  return (
    <div
      className={`presenter-details ${props.standalone ? "standalone-details" : ""}`}
    >
      <SpeakerNotes slide={props.slide} standalone={props.standalone} />
      {!props.standalone && <InteractionPanel {...props} />}
    </div>
  );
}

function SpeakerNotes({
  slide,
  standalone,
}: {
  slide: SlideDefinition;
  standalone?: boolean;
}) {
  const notes = slide.speakerNotes;
  const guide = slide.guide;
  return (
    <section
      className="speaker-notes"
      aria-label={notes ? "Notas del moderador" : "Guía de la slide"}
    >
      <div className="speaker-notes-heading">
        <p className="section-label">
          <NoteBlank size={16} />{" "}
          {notes ? "NOTAS DEL MODERADOR" : "GUÍA DE ESTA SLIDE"}
        </p>
        {notes && (
          <span className="speaker-timing">
            <Clock size={14} /> {notes.timing}
          </span>
        )}
      </div>
      {notes ? (
        <>
          <h2>{slide.title}</h2>
          <p className="speaker-script">{notes.script}</p>
          {!!notes.cues?.length && (
            <ul className="speaker-cues">
              {notes.cues.map((cue) => (
                <li key={cue}>{cue}</li>
              ))}
            </ul>
          )}
          {notes.interaction && (
            <div className="speaker-cue">
              <strong>Participación</strong>
              <p>{notes.interaction}</p>
            </div>
          )}
          {notes.transition && (
            <div className="speaker-cue">
              <strong>Para seguir</strong>
              <p>{notes.transition}</p>
            </div>
          )}
          <span className="small muted">
            Estas notas solo aparecen en el moderador.
          </span>
        </>
      ) : (
        <>
          <h2>{guide.intro}</h2>
          {standalone ? (
            <>
              {guide.sections?.map((section) => (
                <div className="speaker-guide-section" key={section.title}>
                  <h3>{section.title}</h3>
                  <p>{section.body}</p>
                </div>
              ))}
              {guide.takeaway && <p>{guide.takeaway}</p>}
            </>
          ) : (
            <>
              <p>{guide.takeaway || guide.sections?.[0]?.body}</p>
              <span className="small muted">
                El público tiene esta guía en su teléfono.
              </span>
            </>
          )}
        </>
      )}
    </section>
  );
}

function InteractionPanel({
  slide,
  isLive,
  busy,
  ended,
  votingOpen,
  votes,
  onQuestionOpen,
}: PresenterDetailsProps) {
  const question = slide.question;
  return (
    <section className="interaction-panel">
      <div className="interaction-heading">
        <p className="section-label">
          <Broadcast size={17} /> PARTICIPACIÓN
        </p>
        {question && (
          <span
            className={`poll-state ${votingOpen && !ended ? "is-open" : ""}`}
          >
            {votingOpen && !ended ? "Abierta" : "Cerrada"}
          </span>
        )}
      </div>
      {question ? (
        <>
          <h2>{question.prompt}</h2>
          <div className="question-type-label">
            {question.type === "multiple"
              ? "Selección múltiple"
              : question.type === "poll"
                ? "Encuesta"
                : "Opción única"}
            <span>·</span>
            {question.options.length} opciones
          </div>
          {isLive ? (
            <>
              <div className="interaction-actions">
                <button
                  className="button secondary"
                  disabled={busy || ended}
                  onClick={() => onQuestionOpen(!votingOpen)}
                >
                  {votingOpen ? <Stop size={16} /> : <Play size={16} />}
                  {votingOpen ? "Cerrar encuestas" : "Abrir encuestas"}
                </button>
              </div>
              <p className="small muted">
                Los resultados se actualizan en vivo en la proyección y los
                teléfonos. Al cerrar la encuesta, quedan visibles.
              </p>
              <div
                className="moderator-results"
                data-testid="moderator-results"
              >
                <QuestionResults
                  question={question}
                  votes={votes}
                  slideSlug={slide.slug}
                />
              </div>
            </>
          ) : (
            <>
              <div className="preview-options">
                {question.options.map((option) => (
                  <span key={option.id}>{option.label}</span>
                ))}
              </div>
              <p className="small muted">
                Iniciá la presentación para compartir el QR y recibir
                respuestas.
              </p>
            </>
          )}
        </>
      ) : (
        <>
          <h2>Un momento para escuchar.</h2>
          <p className="muted">
            Esta slide no tiene pregunta. El público puede explorar la guía y
            volver a tu slide en vivo.
          </p>
        </>
      )}
    </section>
  );
}
