import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { useEffect, type ReactNode } from "react";
import { View } from "react-native";
import { BOOT_BACKGROUND, bootSurfaceStyles } from "@/constants/boot-surface";

type StartupGateProps = {
  fontsLoaded: boolean;
  children: ReactNode;
};

/**
 * White root surface. Always mounts children so Expo Router's Stack exists.
 * Hides the native splash after this surface is on screen — never on a timer
 * while the JS tree might be empty.
 */
export function StartupGate({ fontsLoaded: _fontsLoaded, children }: StartupGateProps) {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(BOOT_BACKGROUND).catch(() => {});
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      SplashScreen.hideAsync().catch(() => {});
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  return <View style={bootSurfaceStyles.fill}>{children}</View>;
}
