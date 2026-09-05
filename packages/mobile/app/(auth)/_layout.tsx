import { Stack } from "expo-router";
import React from "react";
import { Platform } from "react-native";

export default function AuthLayout() {
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
