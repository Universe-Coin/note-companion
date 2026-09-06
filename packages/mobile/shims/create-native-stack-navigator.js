/**
 * expo-router's fork calls isLiquidGlassAvailable() at require() time.
 * Build 35 still threw there after a resolveRequest-only glass shim.
 * This copy never imports expo-glass-effect.
 */
"use strict";

const native_1 = require("@react-navigation/native");
const native_stack_1 = require("@react-navigation/native-stack");
const React = require("react");
const composition_options_1 = require("expo-router/build/fork/native-stack/composition-options");
const descriptors_context_1 = require("expo-router/build/fork/native-stack/descriptors-context");
const usePreviewTransition_1 = require("expo-router/build/fork/native-stack/usePreviewTransition");
const navigationParams_1 = require("expo-router/build/navigationParams");

const GLASS = false;

function NativeStackNavigator({
  id,
  initialRouteName,
  children,
  layout,
  screenListeners,
  screenOptions,
  screenLayout,
  UNSTABLE_router,
  ...rest
}) {
  const { state, describe, descriptors, navigation, NavigationContent } =
    native_1.useNavigationBuilder(native_1.StackRouter, {
      id,
      initialRouteName,
      children,
      layout,
      screenListeners,
      screenOptions,
      screenLayout,
      UNSTABLE_router,
    });

  React.useEffect(
    () =>
      navigation?.addListener?.("tabPress", (e) => {
        const isFocused = navigation.isFocused();
        requestAnimationFrame(() => {
          if (state.index > 0 && isFocused && !e.defaultPrevented) {
            if (e.data?.__internalTabsType !== "native") {
              navigation.dispatch({
                ...native_1.StackActions.popToTop(),
                target: state.key,
              });
            }
          }
        });
      }),
    [navigation, state.index, state.key],
  );

  const { computedState, computedDescriptors, navigationWrapper } =
    usePreviewTransition_1.usePreviewTransition(
      state,
      navigation,
      descriptors,
      describe,
    );

  const finalDescriptors = React.useMemo(() => {
    let needsNewMap = false;
    const result = {};
    for (const key of Object.keys(computedDescriptors)) {
      const descriptor = computedDescriptors[key];
      const options = descriptor.options;
      const internalGestureEnabled =
        options?.[
          navigationParams_1.INTERNAL_EXPO_ROUTER_GESTURE_ENABLED_OPTION_NAME
        ];
      const needsGestureFix = internalGestureEnabled !== undefined;
      const needsGlassFix = GLASS && options?.presentation === "formSheet";
      if (needsGestureFix || needsGlassFix) {
        needsNewMap = true;
        const newOptions = { ...options };
        if (needsGestureFix) {
          newOptions.gestureEnabled = internalGestureEnabled;
        }
        if (needsGlassFix) {
          newOptions.headerTransparent ??= true;
          newOptions.contentStyle ??= { backgroundColor: "transparent" };
          newOptions.headerShadowVisible ??= false;
          newOptions.headerLargeTitleShadowVisible ??= false;
        }
        result[key] = { ...descriptor, options: newOptions };
      } else {
        result[key] = descriptor;
      }
    }
    return needsNewMap ? result : computedDescriptors;
  }, [computedDescriptors]);

  const { registry, contextValue } = composition_options_1.useCompositionRegistry();
  const mergedDescriptors = React.useMemo(
    () =>
      composition_options_1.mergeOptions(
        finalDescriptors,
        registry,
        computedState,
      ),
    [finalDescriptors, computedState, registry],
  );

  return React.createElement(
    descriptors_context_1.DescriptorsContext,
    { value: descriptors },
    React.createElement(
      NavigationContent,
      null,
      React.createElement(
        composition_options_1.CompositionContext,
        { value: contextValue },
        React.createElement(native_stack_1.NativeStackView, {
          ...rest,
          state: computedState,
          navigation: navigationWrapper,
          descriptors: mergedDescriptors,
          describe,
        }),
      ),
    ),
  );
}

function createNativeStackNavigator(config) {
  return native_1.createNavigatorFactory(NativeStackNavigator)(config);
}

exports.__esModule = true;
exports.createNativeStackNavigator = createNativeStackNavigator;
exports.default = { createNativeStackNavigator };
