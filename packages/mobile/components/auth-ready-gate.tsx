import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { bootSurfaceStyles } from "@/constants/boot-surface";
import { useSafeAuth } from "@/hooks/use-safe-auth";

const AUTH_LOAD_TIMEOUT_MS = 12_000;

type AuthReadyGateProps = {
  children: ReactNode;
};

/**
 * Overlay while Clerk loads. Always mounts children so the root Stack stays
 * in the tree — replacing the navigator is a blank/black Expo Router window.
 */
export function AuthReadyGate({ children }: AuthReadyGateProps) {
  const { isLoaded } = useSafeAuth();
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setTimedOut(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <View style={bootSurfaceStyles.fill}>
      {children}
      {!isLoaded ? (
        <View
          pointerEvents="auto"
          style={[StyleSheet.absoluteFillObject, bootSurfaceStyles.centered]}
        >
          {timedOut ? (
            <>
              <Text style={bootSurfaceStyles.title}>Could not reach sign-in</Text>
              <Text style={bootSurfaceStyles.body}>
                Check your internet connection and force-quit the app, then try
                again.
              </Text>
            </>
          ) : (
            <ActivityIndicator size="large" color="#8a65ed" />
          )}
        </View>
      ) : null}
    </View>
  );
}
