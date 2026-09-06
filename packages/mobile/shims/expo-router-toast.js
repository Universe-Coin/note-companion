/**
 * expo-router's Toast is a "missing default export" developer overlay.
 * In production Hermes it evaluates `StyleSheet.create` and imports the
 * entire `@react-navigation/bottom-tabs` barrel at require() time, which
 * throws TypeError: undefined is not a function (TestFlight builds 31–33).
 * Boot only needs a no-op stand-in.
 */
const React = require("react");

function ToastWrapper({ children }) {
  return children ?? null;
}

function Toast({ children }) {
  return children == null ? null : React.createElement(React.Fragment, null, children);
}

module.exports = {
  Toast,
  ToastWrapper,
  CODE_FONT: "Courier New",
};
