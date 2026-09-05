import { useAuth } from "@clerk/react";

type SafeAuth = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
};

const UNAVAILABLE: SafeAuth = {
  isLoaded: false,
  isSignedIn: undefined,
};

function isThenable(value: unknown): value is PromiseLike<unknown> {
  return (
    value != null &&
    typeof value === "object" &&
    "then" in value &&
    typeof value.then === "function"
  );
}

/**
 * useAuth() throws when ClerkProvider is missing or React context is duplicated.
 * That throw is a production RCTFatal (TestFlight build 24). Always call the hook;
 * catch so boot screens can show UI instead of aborting. Never swallow Suspense
 * thenables — React 19 / Clerk use them to retry.
 */
export function useSafeAuth(): SafeAuth {
  try {
    const { isLoaded, isSignedIn } = useAuth();
    return { isLoaded, isSignedIn };
  } catch (error) {
    if (isThenable(error)) {
      throw error;
    }
    console.warn("[useSafeAuth] Clerk auth is unavailable:", error);
    return UNAVAILABLE;
  }
}
