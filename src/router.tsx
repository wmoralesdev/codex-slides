import {
  createRootRoute,
  createRoute,
  createRouter,
  Outlet,
  Link,
  redirect,
} from "@tanstack/react-router";
import { Library } from "./pages/Library";
import { StaticSlidesPage } from "./pages/StaticSlides";

/**
 * The event is over: the app is read-only. Only the library and the reading view
 * (/slides) render; nothing connects to Convex and no question is shown.
 * The presenter, projection and audience URLs from the event (QR codes, shared
 * links) redirect to the reading view of the same deck.
 */
const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <main className="empty-page">
      <h1>Por aquí no hay slides.</h1>
      <p>Este enlace no existe o cambió de dirección.</p>
      <Link to="/" className="button primary">
        Volver a los decks
      </Link>
    </main>
  ),
  errorComponent: ({ error, reset }) => (
    <main className="empty-page">
      <h1>No pudimos abrir esta vista.</h1>
      <p>
        {error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."}
      </p>
      <button className="button primary" onClick={reset}>
        Reintentar
      </button>
      <a href="/">Volver a los decks</a>
    </main>
  ),
});
const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: Library,
});
export const deckRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/deck/$deckSlug",
  validateSearch: (search: Record<string, unknown>) => ({
    slide: typeof search.slide === "string" ? search.slide : undefined,
  }),
  beforeLoad: ({ params, search }) => {
    throw redirect({ to: "/slides/$deckSlug", params, search });
  },
});
export const presenterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/present/$deckSlug/$sessionId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/slides/$deckSlug", params: { deckSlug: params.deckSlug }, search: { slide: undefined } });
  },
});
export const staticSlidesRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/slides/$deckSlug",
  validateSearch: (search: Record<string, unknown>) => ({
    slide: typeof search.slide === "string" ? search.slide : undefined,
  }),
  component: StaticSlidesPage,
});
export const audienceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/join/$sessionId",
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
});
export const projectionRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/screen/$deckSlug/$sessionId",
  beforeLoad: ({ params }) => {
    throw redirect({ to: "/slides/$deckSlug", params: { deckSlug: params.deckSlug }, search: { slide: undefined } });
  },
});
export const router = createRouter({
  routeTree: rootRoute.addChildren([
    libraryRoute,
    deckRoute,
    staticSlidesRoute,
    presenterRoute,
    audienceRoute,
    projectionRoute,
  ]),
  defaultPreload: "intent",
  scrollRestoration: true,
});
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
