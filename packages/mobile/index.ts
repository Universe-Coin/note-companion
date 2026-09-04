// `@expo/metro-runtime` must stay first (Fast Refresh on web).
import "@expo/metro-runtime";
import { createElement } from "react";
import { StyleSheet, Text, View } from "react-native";

type GlobalErrorUtils = {
  getGlobalHandler?: () => (error: unknown, isFatal?: boolean) => void;
  setGlobalHandler: (
    handler: (error: unknown, isFatal?: boolean) => void,
  ) => void;
};

/**
 * Production TestFlight aborts on uncaught JS via RCTFatal (build 24, 131ms).
 * Keep a visible UI instead of SIGABRT. Dev still uses the default redbox.
 */
function installFatalGuard() {
  const errorUtils = (globalThis as { ErrorUtils?: GlobalErrorUtils })
    .ErrorUtils;
  if (!errorUtils?.setGlobalHandler) return;

  const previous = errorUtils.getGlobalHandler?.();
  errorUtils.setGlobalHandler((error, isFatal) => {
    console.error("[JS]", isFatal ? "fatal" : "error", error);
    if (__DEV__) {
      previous?.(error, isFatal);
      return;
    }
    if (!isFatal) {
      previous?.(error, isFatal);
    }
  });
}

function BootFailed({ message }: { message: string }) {
  return createElement(
    View,
    { style: bootStyles.centered },
    createElement(Text, { style: bootStyles.title }, "Could not start"),
    createElement(Text, { style: bootStyles.body }, message),
  );
}

const bootStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#666",
  },
});

installFatalGuard();

void (async () => {
  const SplashScreen = await import("expo-splash-screen");
  await SplashScreen.preventAutoHideAsync().catch(() => {});
  setTimeout(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, 1500);

  try {
    const { App } = await import("expo-router/build/qualified-entry");
    const { renderRootComponent } = await import(
      "expo-router/build/renderRootComponent"
    );
    renderRootComponent(App);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "The app failed to load.";
    console.error("[Boot] expo-router failed to load:", error);
    const { renderRootComponent } = await import(
      "expo-router/build/renderRootComponent"
    );
    renderRootComponent(() => createElement(BootFailed, { message }));
  }
})();
