// Kept in its own module (no `server-only` / DB imports) so `proxy.ts`
// (edge middleware) can check for the cookie's presence without pulling
// Drizzle/D1 into the middleware bundle.
export const SESSION_COOKIE = "inovatech_session";
