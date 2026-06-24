import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR and the first client render, then true once
 * hydrated. Uses useSyncExternalStore so it never triggers a cascading
 * setState-in-effect and never causes a hydration mismatch — the canonical way
 * to gate client-only (e.g. persisted-store) UI.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}
