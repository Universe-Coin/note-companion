import { InteractionManager, Keyboard } from "react-native";

type SetActiveFn = (params: { session: string }) => Promise<void>;

/** Dismiss keyboard and wait for UI to settle before Clerk persists the session. */
export async function activateClerkSession(
  setActive: SetActiveFn | undefined,
  sessionId: string,
): Promise<void> {
  if (!setActive) {
    throw new Error("Session activation is unavailable");
  }

  Keyboard.dismiss();

  await new Promise<void>((resolve) => {
    InteractionManager.runAfterInteractions(() => resolve());
  });

  // iOS 26: avoid unmounting TextInputs while the keyboard is still animating.
  await new Promise((resolve) => setTimeout(resolve, 200));

  await setActive({ session: sessionId });
}
