import { useEffect, useState, type ComponentType } from "react";
import { ScrollView, Text, View } from "react-native";
import { bootSurfaceStyles } from "@/constants/boot-surface";
import { getBootFatal, subscribeBootFatal } from "@/lib/boot-runtime";

export function BootFailedScreen({ message }: { message: string }) {
  return (
    <View style={bootSurfaceStyles.centered}>
      <Text style={bootSurfaceStyles.title}>Could not start</Text>
      <ScrollView
        style={{ alignSelf: "stretch", maxHeight: 360 }}
        contentContainerStyle={{ paddingBottom: 8 }}
      >
        <Text style={bootSurfaceStyles.body}>{message}</Text>
      </ScrollView>
    </View>
  );
}

export function BootShell({ App }: { App: ComponentType }) {
  const [fatal, setFatal] = useState(getBootFatal);

  useEffect(() => subscribeBootFatal(() => setFatal(getBootFatal())), []);

  useEffect(() => {
    if (!fatal) return;
    void import("expo-splash-screen").then((SplashScreen) =>
      SplashScreen.hideAsync().catch(() => {}),
    );
  }, [fatal]);

  if (fatal) {
    return <BootFailedScreen message={fatal} />;
  }

  return <App />;
}
