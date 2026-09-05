import { ClerkProvider } from "@clerk/expo";
import Constants from "expo-constants";
import { Platform, Text, View } from "react-native";
import { AppErrorBoundary } from "@/components/app-error-boundary";
import { getClerkTokenCache } from "@/utils/token-cache";

const tokenCache = getClerkTokenCache();

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const publishableKey = (
    process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY ??
    (Constants.expoConfig?.extra?.clerkPublishableKey as string | undefined)
  )?.trim();

  if (!publishableKey) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          paddingHorizontal: 24,
          paddingVertical: 32,
          backgroundColor: "#ffffff",
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "600", marginBottom: 12 }}>
          Clerk is not configured
        </Text>
        <Text style={{ fontSize: 15, lineHeight: 22, marginBottom: 16 }}>
          Set{" "}
          <Text style={{ fontFamily: "monospace" }}>
            EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY
          </Text>{" "}
          in{" "}
          <Text style={{ fontFamily: "monospace" }}>packages/mobile/.env</Text>,
          then restart Expo (stop the dev server and run{" "}
          <Text style={{ fontFamily: "monospace" }}>pnpm start</Text> again).
        </Text>
        <Text style={{ fontSize: 14, lineHeight: 20, opacity: 0.8 }}>
          For a physical device, if the QR code does not open the app, try the
          same Wi‑Fi as this computer or run{" "}
          <Text style={{ fontFamily: "monospace" }}>pnpm start:tunnel</Text>.
        </Text>
      </View>
    );
  }

  if (Platform.OS === "web") {
    return (
      <AppErrorBoundary>
        <ClerkProvider publishableKey={publishableKey}>{children}</ClerkProvider>
      </AppErrorBoundary>
    );
  }

  return (
    <AppErrorBoundary>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
        // Native ClerkExpo module is excluded from iOS autolinking (SPM/static frameworks).
        __experimental_disableNativeClientSync
      >
        {children}
      </ClerkProvider>
    </AppErrorBoundary>
  );
}
