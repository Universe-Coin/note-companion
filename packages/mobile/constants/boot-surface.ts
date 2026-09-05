import { StyleSheet } from "react-native";

/** Always-on boot colors so a failed JS tree cannot fall through to a black window. */
export const BOOT_BACKGROUND = "#ffffff";

export const bootSurfaceStyles = StyleSheet.create({
  fill: {
    flex: 1,
    backgroundColor: BOOT_BACKGROUND,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    backgroundColor: BOOT_BACKGROUND,
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
