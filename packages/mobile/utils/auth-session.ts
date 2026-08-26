import {
  InteractionManager,
  Keyboard,
  Platform,
  TextInput,
} from "react-native";
import type { Router } from "expo-router";

type SetActiveFn = (params: { session: string }) => Promise<void>;

/** Leave the sign-in form before activating the session (iOS 26 crash workaround). */
export function navigateToSessionHandoff(
  router: Router,
  sessionId: string,
): void {
  TextInput.State.blurTextInput();
  router.replace({
    pathname: "/(auth)/handoff",
    params: { sessionId },
  });
}

function waitForInputTeardown(): Promise<void> {
  TextInput.State.blurTextInput();

  if (Platform.OS !== "ios") {
    Keyboard.dismiss();
    return Promise.resolve();
  }

  // Avoid Keyboard.dismiss / keyboard listeners on iOS 26 — TurboModule SIGABRT.
  return new Promise((resolve) => setTimeout(resolve, 500));
}

/**
 * Activate a Clerk session after the sign-in screen has unmounted.
 * Called from the handoff screen on iOS; directly elsewhere.
 */
export async function activateClerkSession(
  setActive: SetActiveFn | undefined,
  sessionId: string,
): Promise<void> {
  if (!setActive) {
    throw new Error("Session activation is unavailable");
  }

  await waitForInputTeardown();

  await new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

  if (Platform.OS === "ios") {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  await setActive({ session: sessionId });

  if (Platform.OS === "ios") {
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
}
