/**
 * RN 0.83 / Hermes already ships URL and URLSearchParams.
 * Clerk's `react-native-url-polyfill/auto.js` evaluates a whatwg-url bundle
 * whose module body can throw "undefined is not a function" in production
 * Hermes (Array iterator / Symbol). Skip it.
 */
module.exports = {};
