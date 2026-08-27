// `@expo/metro-runtime` must stay first (Fast Refresh on web).
import "@expo/metro-runtime";

void (async () => {
  const SplashScreen = await import("expo-splash-screen");
  await SplashScreen.preventAutoHideAsync().catch(() => {});
  setTimeout(() => {
    void SplashScreen.hideAsync().catch(() => {});
  }, 1500);

  const { App } = await import("expo-router/build/qualified-entry");
  const { renderRootComponent } = await import(
    "expo-router/build/renderRootComponent"
  );
  renderRootComponent(App);
})();
