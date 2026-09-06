"use strict";

function notAvailable() {
  return false;
}

exports.__esModule = true;
exports.isLiquidGlassAvailable = notAvailable;
exports.isGlassEffectAPIAvailable = notAvailable;
exports.GlassView = function GlassView() {
  return null;
};
exports.GlassContainer = function GlassContainer() {
  return null;
};
exports.default = {
  isLiquidGlassAvailable: notAvailable,
  isGlassEffectAPIAvailable: notAvailable,
  GlassView: exports.GlassView,
  GlassContainer: exports.GlassContainer,
};
