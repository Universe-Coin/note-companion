import type { ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

export function AuthLoadFailed({ children: _children }: { children?: ReactNode }) {
  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Could not load sign-in</Text>
      <Text style={styles.body}>
        Force-quit the app and try again. Sign-in failed to start on this
        device.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    textAlign: "center",
    color: "#333",
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
    color: "#666",
  },
});
