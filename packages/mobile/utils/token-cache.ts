import { Platform } from "react-native";

type TokenCache = {
  getToken: (key: string) => Promise<string | null | undefined>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
};

function createMemoryTokenCache(): TokenCache {
  const tokens = new Map<string, string>();

  return {
    async getToken(key) {
      return tokens.get(key) ?? null;
    },
    async saveToken(key, value) {
      tokens.set(key, value);
    },
    async clearToken(key) {
      tokens.delete(key);
    },
  };
}

let secureStoreCache: TokenCache | null = null;

async function getSecureStoreCache(): Promise<TokenCache> {
  if (!secureStoreCache) {
    const { createSecureStoreTokenCache } = await import(
      "./secure-store-token-cache"
    );
    secureStoreCache = createSecureStoreTokenCache();
  }
  return secureStoreCache;
}

/** iOS: in-memory only (expo-secure-store TurboModule hangs on iOS 26). Android: SecureStore. Web: undefined. */
export function getClerkTokenCache(): TokenCache | undefined {
  if (Platform.OS === "web") {
    return undefined;
  }

  if (Platform.OS === "ios") {
    return createMemoryTokenCache();
  }

  return {
    async getToken(key) {
      const cache = await getSecureStoreCache();
      return cache.getToken(key);
    },
    async saveToken(key, value) {
      const cache = await getSecureStoreCache();
      await cache.saveToken(key, value);
    },
    async clearToken(key) {
      const cache = await getSecureStoreCache();
      await cache.clearToken?.(key);
    },
  };
}
