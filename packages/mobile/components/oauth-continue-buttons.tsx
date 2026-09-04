import { useOAuth } from "@clerk/expo";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as WebBrowser from "expo-web-browser";
import { GoogleGLogo } from "@/components/google-g-logo";
import { navigateToSessionHandoff } from "@/utils/auth-session";
import { getOAuthRedirectUrl, prepareOAuthBrowserSession } from "@/utils/oauth";

type OAuthContinueButtonsProps = {
  disabled?: boolean;
  appleDark?: boolean;
};

/**
 * Isolated so sign-in/sign-up route modules do not import @clerk/expo at boot.
 * Expo Router evaluates route files on launch; a top-level useOAuth import
 * loads clerk-js immediately and can RCTFatal before the first screen.
 */
export function OAuthContinueButtons({
  disabled = false,
  appleDark = false,
}: OAuthContinueButtonsProps) {
  const router = useRouter();
  const { startOAuthFlow: googleAuth } = useOAuth({ strategy: "oauth_google" });
  const { startOAuthFlow: appleAuth } = useOAuth({ strategy: "oauth_apple" });
  const [loading, setLoading] = useState(false);
  const busy = disabled || loading;

  const finish = useCallback(
    (createdSessionId: string | null | undefined) => {
      if (createdSessionId) {
        navigateToSessionHandoff(router, createdSessionId);
      }
    },
    [router],
  );

  const onGoogle = useCallback(async () => {
    try {
      setLoading(true);
      prepareOAuthBrowserSession();
      await WebBrowser.warmUpAsync();
      const { createdSessionId } = await googleAuth({
        redirectUrl: getOAuthRedirectUrl(),
      });
      finish(createdSessionId);
    } catch (err) {
      console.error("[OAuth] Google error:", err);
      Alert.alert("Error", "Failed to sign in with Google");
    } finally {
      setLoading(false);
    }
  }, [finish, googleAuth]);

  const onApple = useCallback(async () => {
    try {
      setLoading(true);
      prepareOAuthBrowserSession();
      await WebBrowser.warmUpAsync();
      const { createdSessionId } = await appleAuth({
        redirectUrl: getOAuthRedirectUrl(),
      });
      finish(createdSessionId);
    } catch (err) {
      console.error("[OAuth] Apple error:", err);
      Alert.alert("Error", "Failed to sign in with Apple");
    } finally {
      setLoading(false);
    }
  }, [appleAuth, finish]);

  return (
    <View style={styles.buttonContainer}>
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={onGoogle}
        disabled={busy}
      >
        <GoogleGLogo size={24} />
        <Text style={styles.buttonText}>Continue with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          appleDark ? styles.appleButtonDark : styles.appleButton,
        ]}
        onPress={onApple}
        disabled={busy}
      >
        <Ionicons
          name="logo-apple"
          size={24}
          color={appleDark ? "#FFFFFF" : "#000000"}
        />
        <Text
          style={[styles.buttonText, appleDark ? styles.appleButtonText : null]}
        >
          Continue with Apple
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {
    width: "100%",
    gap: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    width: "100%",
    gap: 12,
    borderWidth: 1,
  },
  googleButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  appleButton: {
    backgroundColor: "#fff",
    borderColor: "#ddd",
  },
  appleButtonDark: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  appleButtonText: {
    color: "#fff",
  },
});
