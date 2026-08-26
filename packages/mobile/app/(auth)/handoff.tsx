import React, { useEffect, useRef } from "react";
import { ActivityIndicator, Platform, StyleSheet, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuth, useClerk } from "@clerk/react";
import { activateClerkSession } from "@/utils/auth-session";
import { useSemanticColor } from "@/hooks/useThemeColor";

/**
 * Blank screen with no TextInputs. Sign-in navigates here first so the sign-in
 * form unmounts before setActive runs, then this screen navigates to tabs.
 */
export default function HandoffScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();
  const { isLoaded } = useAuth();
  const { setActive } = useClerk();
  const router = useRouter();
  const primaryColor = useSemanticColor("primary");
  const startedRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || !sessionId || startedRef.current) return;
    startedRef.current = true;

    const run = async () => {
      try {
        await activateClerkSession(
          setActive ? (params) => setActive(params) : undefined,
          sessionId,
        );

        const enterApp = () => router.replace("/(tabs)");
        if (Platform.OS === "ios") {
          setTimeout(enterApp, 300);
        } else {
          enterApp();
        }
      } catch (error) {
        console.error("[Handoff] Session activation failed:", error);
        router.replace("/(auth)/sign-in");
      }
    };

    if (Platform.OS === "ios") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          void run();
        });
      });
    } else {
      void run();
    }
  }, [isLoaded, sessionId, setActive, router]);

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={primaryColor} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "white",
  },
});
