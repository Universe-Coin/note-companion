import { Stack } from "expo-router";
import React from "react";
import { useSafeAuth } from "@/hooks/use-safe-auth";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  View,
} from "react-native";
import { useSemanticColor } from "@/hooks/useThemeColor";

export default function AuthLayout() {
  const { isLoaded } = useSafeAuth();
  const primaryColor = useSemanticColor("primary");

  if (!isLoaded) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={primaryColor} />
      </View>
    );
  }

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "white" },
        animation: Platform.OS === "ios" ? "none" : "slide_from_right",
      }}
      initialRouteName="index"
    >
      <Stack.Screen name="index" options={{ animation: "none" }} />
      <Stack.Screen name="handoff" options={{ animation: "none" }} />
      <Stack.Screen name="sign-in" options={{ animation: "none" }} />
      <Stack.Screen name="sign-up" options={{ animation: "none" }} />
      <Stack.Screen name="welcome" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
