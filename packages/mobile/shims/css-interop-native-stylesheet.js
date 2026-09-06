/**
 * css-interop's web StyleSheet copies RN's StyleSheet (including create()).
 * The native build does not, so StyleSheet.create is undefined and Hermes
 * throws "undefined is not a function" as soon as a module calls it.
 */
const { StyleSheet: RNStyleSheet } = require("react-native");
const { getStyle, injectData } = require("react-native-css-interop/dist/runtime/native/styles");
const { flags } = require("react-native-css-interop/dist/runtime/native/globals");

exports.StyleSheet = Object.assign({}, RNStyleSheet, {
  getGlobalStyle(name) {
    return getStyle(name);
  },
  register() {
    throw new Error("Not yet implemented");
  },
  registerCompiled(options) {
    return injectData(options);
  },
  getFlag(name) {
    return flags.get(name)?.toString();
  },
});
