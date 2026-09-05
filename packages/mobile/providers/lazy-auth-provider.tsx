import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { View } from "react-native";
import { AuthLoadFailed } from "@/components/auth-load-failed";
import { bootSurfaceStyles } from "@/constants/boot-surface";

type AuthProviderComponent = ComponentType<{ children: ReactNode }>;

type LazyAuthProviderProps = {
  children: ReactNode;
};

/**
 * Loads Clerk after the first frame so native init does not block paint.
 * Children stay mounted the whole time — Suspense/early return would unmount
 * Expo Router's Stack and leave a blank native screen.
 */
export function LazyAuthProvider({ children }: LazyAuthProviderProps) {
  const [Provider, setProvider] = useState<AuthProviderComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const frame = requestAnimationFrame(() => {
      void import("./auth")
        .then((module) => {
          if (!cancelled) {
            setProvider(() => module.AuthProvider);
          }
        })
        .catch((error) => {
          console.error("[Auth] Failed to load Clerk:", error);
          if (!cancelled) setFailed(true);
        });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
    };
  }, []);

  if (failed) {
    return <AuthLoadFailed />;
  }

  if (!Provider) {
    return <View style={bootSurfaceStyles.fill}>{children}</View>;
  }

  return <Provider>{children}</Provider>;
}
