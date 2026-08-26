import * as SecureStore from "expo-secure-store";

const KEYCHAIN_SERVICE = "ai.notecompanion.app";
const LEGACY_KEYCHAIN_SERVICE = "app";

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: KEYCHAIN_SERVICE,
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

const LEGACY_SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainService: LEGACY_KEYCHAIN_SERVICE,
  keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
};

async function readSecureToken(key: string): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync(key, SECURE_STORE_OPTIONS);
    if (token) return token;
  } catch (err) {
    console.error(`[TokenCache] Error reading token for key ${key}:`, err);
  }

  try {
    const legacyToken = await SecureStore.getItemAsync(
      key,
      LEGACY_SECURE_STORE_OPTIONS,
    );
    if (legacyToken) {
      await SecureStore.setItemAsync(key, legacyToken, SECURE_STORE_OPTIONS);
      await SecureStore.deleteItemAsync(key, LEGACY_SECURE_STORE_OPTIONS);
      return legacyToken;
    }
  } catch (err) {
    console.error(`[TokenCache] Error migrating legacy token for key ${key}:`, err);
  }

  return null;
}

export function createSecureStoreTokenCache() {
  return {
    async getToken(key: string) {
      try {
        return await readSecureToken(key);
      } catch (err) {
        console.error(`[TokenCache] Error retrieving token for key ${key}:`, err);
        return null;
      }
    },
    async saveToken(key: string, value: string) {
      try {
        await SecureStore.setItemAsync(key, value, SECURE_STORE_OPTIONS);
      } catch (err) {
        console.error(`[TokenCache] Error saving token for key ${key}:`, err);
      }
    },
    async clearToken(key: string) {
      try {
        await SecureStore.deleteItemAsync(key, SECURE_STORE_OPTIONS);
        await SecureStore.deleteItemAsync(key, LEGACY_SECURE_STORE_OPTIONS);
      } catch (err) {
        console.error(`[TokenCache] Error clearing token for key ${key}:`, err);
      }
    },
  };
}
