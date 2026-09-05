const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const fs = require("fs");
const path = require("path");

const mobileRoot = __dirname;
const repoRoot = path.join(mobileRoot, "../..");

/** Resolve a bare specifier from this package only (avoids hoisted React 19 at repo root). */
function resolveFromMobile(moduleName) {
  return require.resolve(moduleName, { paths: [mobileRoot, repoRoot] });
}

let config = getDefaultConfig(mobileRoot);

function packageRootFromEntry(entryFile) {
  let dir = path.dirname(entryFile);
  for (let i = 0; i < 8; i++) {
    if (fs.existsSync(path.join(dir, "package.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return path.dirname(path.dirname(entryFile));
}

function resolvePackageRoot(moduleName, fallbackSegments) {
  try {
    return packageRootFromEntry(resolveFromMobile(moduleName));
  } catch {
    return path.join(mobileRoot, ...fallbackSegments);
  }
}

const clerkJsBrowserEntry = (() => {
  try {
    return resolveFromMobile("@clerk/clerk-js");
  } catch {
    return null;
  }
})();
const clerkJsNativeEntry = clerkJsBrowserEntry
  ? path.join(path.dirname(clerkJsBrowserEntry), "clerk.native.js")
  : null;

const rngPath = path.join(mobileRoot, "node_modules", "react-native-gesture-handler");

// Real package roots — mobile/node_modules/@clerk is not populated in this monorepo.
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    react: path.join(mobileRoot, "node_modules/react"),
    "react-dom": path.join(mobileRoot, "node_modules/react-dom"),
    "react-native": path.join(mobileRoot, "node_modules/react-native"),
    "react-native-gesture-handler": rngPath,
    "@clerk/expo": resolvePackageRoot("@clerk/expo", ["node_modules", "@clerk", "expo"]),
    "@clerk/react": resolvePackageRoot("@clerk/react", ["node_modules", "@clerk", "react"]),
    "@clerk/clerk-js": clerkJsBrowserEntry
      ? packageRootFromEntry(clerkJsBrowserEntry)
      : path.join(repoRoot, "node_modules", "@clerk", "clerk-js"),
    "@clerk/shared": resolvePackageRoot("@clerk/shared", ["node_modules", "@clerk", "shared"]),
    "@clerk/backend": resolvePackageRoot("@clerk/backend", ["node_modules", "@clerk", "backend"]),
    "@clerk/localizations": resolvePackageRoot("@clerk/localizations", [
      "node_modules",
      "@clerk",
      "localizations",
    ]),
    "@clerk/types": resolvePackageRoot("@clerk/types", ["node_modules", "@clerk", "types"]),
  },
};

const existingBlockList = config.resolver.blockList;
const blockListArray = Array.isArray(existingBlockList)
  ? existingBlockList
  : existingBlockList != null
    ? [existingBlockList]
    : [];
config.resolver.blockList = [
  ...blockListArray,
  /\.\.\/.+\/node_modules\/react\//,
  /\.\.\/.+\/node_modules\/react-dom\//,
  /\.\.\/.+\/node_modules\/react-native\//,
  /\.\.\/.+\/node_modules\/react-native-gesture-handler\//,
  /\.\.\/.+\/node_modules\/@clerk\//,
];

// withNativeWind → withCssInterop merges resolver but can still leave duplicate React on web.
config = withNativeWind(config, { input: "./global.css" });

const bareReactFamily = new Set([
  "react",
  "react-dom",
  "react-dom/client",
  "react-dom/server",
  "react-dom/server.browser",
  "scheduler",
]);

/**
 * One physical @clerk/* tree so ClerkProvider and useAuth share the same React context.
 * Do NOT require.resolve("@clerk/clerk-js") on native — Node picks dist/clerk.js (DOM).
 * That throws "undefined is not a function" as soon as ClerkProvider constructs Clerk.
 */
function tryForceClerk(moduleName, platform) {
  if (!moduleName.startsWith("@clerk/")) return null;
  try {
    // Metro sometimes resolves with platform null / "native". Only web wants DOM clerk.js.
    if (moduleName === "@clerk/clerk-js" && platform !== "web" && clerkJsNativeEntry) {
      return {
        type: "sourceFile",
        filePath: clerkJsNativeEntry,
      };
    }
    return {
      type: "sourceFile",
      filePath: resolveFromMobile(moduleName),
    };
  } catch {
    return null;
  }
}

function tryForceGestureHandler(moduleName) {
  if (
    moduleName === "react-native-gesture-handler" ||
    moduleName.startsWith("react-native-gesture-handler/")
  ) {
    try {
      return {
        type: "sourceFile",
        filePath: resolveFromMobile(moduleName),
      };
    } catch {
      return null;
    }
  }
  return null;
}

function tryForceModule(moduleName) {
  if (bareReactFamily.has(moduleName)) {
    try {
      return {
        type: "sourceFile",
        filePath: resolveFromMobile(moduleName),
      };
    } catch {
      return null;
    }
  }
  if (moduleName.startsWith("react/")) {
    try {
      return {
        type: "sourceFile",
        filePath: resolveFromMobile(moduleName),
      };
    } catch {
      return null;
    }
  }
  return null;
}

const previousResolveRequest = config.resolver.resolveRequest;
const secureStoreShim = path.join(mobileRoot, "shims/expo-secure-store.js");
const urlPolyfillAutoShim = path.join(
  mobileRoot,
  "shims/react-native-url-polyfill-auto.js",
);

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform !== "web" &&
    (moduleName === "react-native-url-polyfill/auto" ||
      moduleName === "react-native-url-polyfill/auto.js")
  ) {
    return { type: "sourceFile", filePath: urlPolyfillAutoShim };
  }

  if (
    platform === "ios" &&
    (moduleName === "expo-secure-store" ||
      moduleName.startsWith("expo-secure-store/"))
  ) {
    return { type: "sourceFile", filePath: secureStoreShim };
  }

  const forcedClerk = tryForceClerk(moduleName, platform);
  if (forcedClerk) {
    return forcedClerk;
  }
  const forcedRng = tryForceGestureHandler(moduleName);
  if (forcedRng) {
    return forcedRng;
  }
  const forced = tryForceModule(moduleName);
  if (forced) {
    return forced;
  }
  if (previousResolveRequest) {
    return previousResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
