import { Component, type ErrorInfo, type ReactNode } from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

/**
 * Catches render errors that would otherwise become RCTFatal / SIGABRT
 * in production (TestFlight).
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[AppErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <View style={styles.centered}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.body}>
            Force-quit the app and try again. If it keeps happening, the error
            was: {this.state.error.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
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
