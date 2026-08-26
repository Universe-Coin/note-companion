import { useAuth } from "@clerk/react";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

const AUTH_LOAD_TIMEOUT_MS = 12_000;
const FONT_LOAD_TIMEOUT_MS = 5_000;

type StartupGateProps = {
  fontsLoaded: boolean;
  children: React.ReactNode;
};

/**
 * Keeps the native splash visible until fonts and Clerk are ready, then hides it.
 * Shows a spinner or timeout message instead of a blank screen.
 */
export function StartupGate({ fontsLoaded, children }: StartupGateProps) {
  const { isLoaded: authLoaded } = useAuth();
  const [fontTimedOut, setFontTimedOut] = useState(false);
  const [authTimedOut, setAuthTimedOut] = useState(false);

  const fontsReady = fontsLoaded || fontTimedOut;
  const authReady = authLoaded || authTimedOut;
  const appReady = fontsReady && authReady;

  useEffect(() => {
    SplashScreen.preventAutoHideAsync().catch(() => {});
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setFontTimedOut(true), FONT_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!fontsReady) return;
    const timer = setTimeout(() => setAuthTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, [fontsReady]);

  useEffect(() => {
    if (appReady) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [appReady]);

  if (!fontsReady) {
    return null;
  }

  if (!authReady) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8a65ed" />
      </View>
    );
  }

  if (authTimedOut && !authLoaded) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Could not reach sign-in</Text>
        <Text style={styles.body}>
          Check your internet connection and force-quit the app, then try again.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}

const styles = StyleSheet.create({
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
