import { Platform } from 'react-native';

/**
 * AsyncStorage often has no native module on web / hybrid runtimes ("Native module is null").
 * Prefer localStorage when available; otherwise native AsyncStorage; then in-memory fallback.
 */
type AsyncStorageLike = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const webStorage: AsyncStorageLike = {
  getItem(key) {
    try {
      if (typeof globalThis.localStorage === 'undefined') {
        return Promise.resolve(null);
      }
      return Promise.resolve(globalThis.localStorage.getItem(key));
    } catch {
      return Promise.resolve(null);
    }
  },
  setItem(key, value) {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.setItem(key, value);
      }
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  },
  removeItem(key) {
    try {
      if (typeof globalThis.localStorage !== 'undefined') {
        globalThis.localStorage.removeItem(key);
      }
    } catch {
      /* ignore */
    }
    return Promise.resolve();
  },
};

function memoryStorage(): AsyncStorageLike {
  const mem = new Map<string, string>();
  return {
    getItem(key) {
      return Promise.resolve(mem.get(key) ?? null);
    },
    setItem(key, value) {
      mem.set(key, value);
      return Promise.resolve();
    },
    removeItem(key) {
      mem.delete(key);
      return Promise.resolve();
    },
  };
}

function hasLocalStorage(): boolean {
  try {
    return (
      typeof globalThis !== 'undefined' &&
      typeof globalThis.localStorage !== 'undefined' &&
      typeof globalThis.localStorage.setItem === 'function'
    );
  } catch {
    return false;
  }
}

function loadNativeAsyncStorage(): AsyncStorageLike | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage').default;
    if (mod && typeof mod.setItem === 'function') {
      return mod;
    }
  } catch {
    /* ignore */
  }
  return null;
}

/** Try primary; on any failure use fallback (handles AsyncStorage native module null at runtime). */
function wrapWithFallback(
  primary: AsyncStorageLike,
  fallback: AsyncStorageLike
): AsyncStorageLike {
  return {
    async getItem(key) {
      try {
        return await primary.getItem(key);
      } catch {
        return fallback.getItem(key);
      }
    },
    async setItem(key, value) {
      try {
        await primary.setItem(key, value);
      } catch {
        await fallback.setItem(key, value);
      }
    },
    async removeItem(key) {
      try {
        await primary.removeItem(key);
      } catch {
        await fallback.removeItem(key);
      }
    },
  };
}

function resolveStorage(): AsyncStorageLike {
  const mem = memoryStorage();

  // Expo Web / browsers: localStorage — avoids importing broken native bridge
  if (Platform.OS === 'web' || hasLocalStorage()) {
    return wrapWithFallback(webStorage, mem);
  }

  const native = loadNativeAsyncStorage();
  if (native) {
    // Native failed (e.g. native module null at runtime) → memory; avoid web on device.
    return wrapWithFallback(native, mem);
  }

  return wrapWithFallback(webStorage, mem);
}

export const appStorage: AsyncStorageLike = resolveStorage();
