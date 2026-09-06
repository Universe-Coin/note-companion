/**
 * expo-router's native stack calls isLiquidGlassAvailable() at require() time.
 * This app does not ship the ExpoGlassEffect native module (not a direct
 * dependency / not in plugins), so the iOS implementation's
 * requireNativeModule('ExpoGlassEffect') throws in production Hermes.
 */
function notAvailable() {
  return false;
}

module.exports = {
  isLiquidGlassAvailable: notAvailable,
  isGlassEffectAPIAvailable: notAvailable,
  GlassView: () => null,
  GlassContainer: () => null,
};
