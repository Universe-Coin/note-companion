// `@expo/metro-runtime` must stay first (Fast Refresh on web).
import "@expo/metro-runtime";
import { createElement } from "react";
import { formatBootError, reportBootFatal } from "./lib/boot-runtime";

type GlobalErrorUtils = {
  getGlobalHandler?: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (
    handler: (error: unknown, isFatal?: boolean) => void,
  ) => void;
};

/**
 * Production TestFlight aborts on uncaught JS via RCTFatal (build 24).
 * Do not call registerRootComponent again — that is a no-op on native and
 * leaves a dead window. BootShell already mounted listens for reportBootFatal.
 * Dev still uses the default redbox.
 */
function installFatalGuard() {
  const errorUtils = (globalThis as { ErrorUtils?: GlobalErrorUtils })
    .ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;

  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error, isFatal) => {
    const message = formatBootError(error);
    console.error("[JS]", isFatal ? "fatal" : "error", error);

    if (__DEV__) {
      previous?.(error, isFatal);
      return;
    }

    if (isFatal) {
      reportBootFatal(message);
      return;
    }

    previous?.(error, isFatal);
  });
}

installFatalGuard();

void (async () => {
  const SplashScreen = await import("expo-splash-screen");
  await SplashScreen.preventAutoHideAsync().catch(() => {});
  // Do not force-hide here. A timed hide with a dead JS tree is a black screen.

  try {
    const { App } = await import("expo-router/build/qualified-entry");
    const { renderRootComponent } = await import(
      "expo-router/build/renderRootComponent"
    );
    const { BootShell } = await import("./components/boot-shell");
    const Root = () => createElement(BootShell, { App });
    renderRootComponent(Root);
    // expo-router wraps ErrorUtils on a timeout and hides splash on any error.
    // Re-install after that wrap so fatals update BootShell instead of a blank view.
    setTimeout(installFatalGuard, 20);
  } catch (error) {
    const message = formatBootError(error);
    console.error("[Boot] expo-router failed to load:", error);
    const { renderRootComponent } = await import(
      "expo-router/build/renderRootComponent"
    );
    const { BootFailedScreen } = await import("./components/boot-shell");
    renderRootComponent(() => createElement(BootFailedScreen, { message }));
    await SplashScreen.hideAsync().catch(() => {});
  }
})();
