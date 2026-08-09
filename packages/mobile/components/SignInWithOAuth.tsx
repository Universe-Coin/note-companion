import React from "react";
import { Button, View, StyleSheet } from "react-native";
import { useOAuth } from "@clerk/clerk-expo";
import * as WebBrowser from "expo-web-browser";
import { getOAuthRedirectUrl, prepareOAuthBrowserSession } from "@/utils/oauth";

export function SignInWithOAuth() {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const onPress = React.useCallback(async () => {
    try {
      prepareOAuthBrowserSession();
      await WebBrowser.warmUpAsync();
      const redirectUrl = getOAuthRedirectUrl();
      const { createdSessionId, signIn, signUp, setActive } =
        await startOAuthFlow({ redirectUrl });

      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error("OAuth error", err);
    }
  }, []);

  return (
    <View style={styles.container}>
      <Button
        title="Sign in with Google"
        onPress={onPress}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
}); 