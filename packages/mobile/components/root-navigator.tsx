import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { useSafeAuth } from "@/hooks/use-safe-auth";

/**
 * Root stack navigator. Sign-in → tabs navigation is handled by the handoff
 * screen after session activation to avoid competing router.replace calls.
 * This component only guards tabs when the user is signed out.
 */
export function RootNavigator() {
  const { isLoaded, isSignedIn } = useSafeAuth();
  const router = useRouter();
  const segments = useSegments();
  const redirectingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded || redirectingRef.current) return;

    const inAuthGroup = segments[0] === "(auth)";
    const inTabsGroup = segments[0] === "(tabs)";

    if (isSignedIn && inAuthGroup) {
      redirectingRef.current = true;
      router.replace("/(tabs)");
      redirectingRef.current = false;
      return;
    }

    if (!isSignedIn && inTabsGroup) {
      redirectingRef.current = true;
      router.replace("/(auth)");
      redirectingRef.current = false;
    }
  }, [isLoaded, isSignedIn, segments, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#ffffff" },
        animation: Platform.OS === "ios" ? "none" : "fade",
      }}
      initialRouteName="(auth)"
    >
      <Stack.Screen name="(tabs)" options={{ animation: "none" }} />
      <Stack.Screen name="(auth)" options={{ animation: "none" }} />
    </Stack>
  );
}
