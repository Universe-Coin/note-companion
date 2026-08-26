import { Platform } from "react-native";

type TokenCache = {
  getToken: (key: string) => Promise<string | null | undefined>;
  saveToken: (key: string, value: string) => Promise<void>;
  clearToken?: (key: string) => Promise<void>;
};

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

/** Encrypted SecureStore persistence on native; unavailable on web. */
export function getClerkTokenCache(): TokenCache | undefined {
  if (Platform.OS === "web") {
    return undefined;
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
