import { useAuth } from "@clerk/react";

type SafeAuth = {
  isLoaded: boolean;
  isSignedIn: boolean | undefined;
};

const UNAVAILABLE: SafeAuth = {
  isLoaded: false,
  isSignedIn: undefined,
};

/**
 * useAuth() throws when ClerkProvider is missing or React context is duplicated.
 * That throw is a production RCTFatal (TestFlight build 24). Always call the hook;
 * catch so boot screens can show UI instead of aborting.
 */
export function useSafeAuth(): SafeAuth {
  try {
    const { isLoaded, isSignedIn } = useAuth();
    return { isLoaded, isSignedIn };
  } catch (error) {
    console.warn("[useSafeAuth] Clerk auth is unavailable:", error);
    return UNAVAILABLE;
  }
}
