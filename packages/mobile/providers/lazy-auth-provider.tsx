import { Suspense, lazy, useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { AuthLoadFailed } from "@/components/auth-load-failed";

const AuthProviderInner = lazy(() =>
  import("./auth")
    .then((module) => ({ default: module.AuthProvider }))
    .catch((error) => {
      console.error("[Auth] Failed to load Clerk:", error);
      return { default: AuthLoadFailed };
    }),
);

type LazyAuthProviderProps = {
  children: React.ReactNode;
};

/**
 * Defers loading @clerk/expo until after the first frame so splash can hide
 * and native TurboModule init does not block the initial paint.
 * Import failure renders AuthLoadFailed instead of an uncaught rejection.
 */
export function LazyAuthProvider({ children }: LazyAuthProviderProps) {
  const [deferClerk, setDeferClerk] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      requestAnimationFrame(() => setDeferClerk(true));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  if (!deferClerk) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8a65ed" />
      </View>
    );
  }

  return (
    <Suspense
      fallback={
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#8a65ed" />
        </View>
      }
    >
      <AuthProviderInner>{children}</AuthProviderInner>
    </Suspense>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
});
