import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowUpRight,
  GearSix,
  Broadcast,
  Cube,
  QrCode,
  DeviceMobile,
  ArrowRight,
} from "@phosphor-icons/react";
import { Face } from "../devday/Face";
import { FACE_PALETTE, FACE_PRESETS } from "../devday/faces";
import { Modal } from "./Modal";
import { useLive } from "../live/LiveProvider";

export function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/" className="brand" aria-label="DevDay Slides, inicio">
      <Face config={{ ...FACE_PRESETS.squeeze, color: FACE_PALETTE.blue }} />
      <span>
        DevDay<span className="brand-light"> Slides</span>
      </span>
      {!compact && <span className="beta-label">San Salvador</span>}
    </Link>
  );
}

export function ConfigContent() {
  const live = useLive();
  return (
    <>
      <div className="config-status">
        <span
          className={`status-dot ${live.mode === "convex" ? "green" : ""}`}
        />
        <strong>
          {live.mode === "local"
            ? "No ha sido configurado Convex"
            : "Convex configurado"}
        </strong>
      </div>
      <p className="muted">
        {live.mode === "local"
          ? "Puedes presentar, entrar como visitante y responder desde otras pestañas de este navegador."
          : "Las sesiones se sincronizan entre dispositivos mediante tu proyecto de Convex."}
      </p>
      {live.mode === "local" && (
        <div className="notice">
          El modo local no conecta otros teléfonos. Para una presentación con
          público, configura Convex y publica esta app.
        </div>
      )}
      <ol className="setup-steps">
        <li>
          Crea tu proyecto ejecutando <code>npx convex dev</code>.
        </li>
        <li>
          Agrega su URL en <code>VITE_CONVEX_URL</code> dentro de{" "}
          <code>.env.local</code>.
        </li>
        <li>
          Asigna <code>VITE_WORKSPACE_SLUG</code> a tu variante y reinicia la
          app.
        </li>
      </ol>
      <p className="small muted">
        Las instrucciones completas están en el README del proyecto.
      </p>
    </>
  );
}

/** Header for the read-only archive: no live connection to report. */
export function ReadOnlyHeader() {
  return (
    <header className="app-header">
      <Brand />
      <nav className="main-nav" aria-label="Navegación principal">
        <Link to="/" className="nav-active">
          Decks
        </Link>
      </nav>
    </header>
  );
}

export function ShellHeader() {
  const [modal, setModal] = useState<"config" | "help" | null>(null);
  const { mode } = useLive();
  return (
    <>
      <header className="app-header">
        <Brand />
        <nav className="main-nav" aria-label="Navegación principal">
          <Link to="/" className="nav-active">
            Decks
          </Link>
          <button onClick={() => setModal("help")}>
            Cómo funciona <ArrowUpRight size={14} />
          </button>
        </nav>
        <button
          className="connection-button"
          onClick={() => setModal("config")}
        >
          <span className={`status-dot ${mode === "convex" ? "green" : ""}`} />
          <span>{mode === "local" ? "Modo local" : "Convex"}</span>
          <GearSix size={17} />
        </button>
      </header>
      {modal && (
        <Modal
          title={
            modal === "config"
              ? "Conexión en vivo"
              : "Una presentación compartida"
          }
          onClose={() => setModal(null)}
        >
          {modal === "config" ? (
            <ConfigContent />
          ) : (
            <>
              <p className="muted">
                Tú llevas el ritmo. El público forma parte de la conversación.
              </p>
              <div className="how-step">
                <Cube />
                <div>
                  <h3>Elige tu deck</h3>
                  <p>
                    Cada slide es un componente React que puedes hacer tuyo.
                  </p>
                </div>
              </div>
              <div className="how-step">
                <QrCode />
                <div>
                  <h3>Comparte un solo QR</h3>
                  <p>
                    Al iniciar, cada sesión recibe su propio enlace. Sin
                    registro ni contraseñas para el público.
                  </p>
                </div>
              </div>
              <div className="how-step">
                <DeviceMobile />
                <div>
                  <h3>Una guía en cada teléfono</h3>
                  <p>
                    El público explora a su ritmo y puede volver a tu slide en
                    vivo. Tú decides qué pregunta se puede responder.
                  </p>
                </div>
              </div>
              <button
                className="button primary full-width"
                onClick={() => setModal(null)}
              >
                Explorar los decks <ArrowRight />
              </button>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function ConnectionNotice() {
  const { mode, configurationMessage } = useLive();
  if (mode === "convex") return null;
  return (
    <div className="connection-notice">
      <Broadcast size={17} />
      <span>
        <strong>No ha sido configurado Convex</strong>
        <span className="notice-detail">
          {" "}
          · Estás explorando en modo local. La sincronización funciona entre
          pestañas de este navegador.
        </span>
        {configurationMessage &&
          configurationMessage !== "No ha sido configurado Convex" && (
            <span> {configurationMessage}</span>
          )}
      </span>
    </div>
  );
}
