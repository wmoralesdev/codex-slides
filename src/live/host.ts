/** Running from a local dev server: the projected slides skip their questions. */
export const isLocalhost =
  typeof window !== "undefined" &&
  ["localhost", "127.0.0.1", "[::1]"].includes(window.location.hostname);
