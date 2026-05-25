/**
 * Generic typed localStorage hook for Ashes of War.
 * Handles JSON serialisation/deserialisation, versioned schemas,
 * JSON parse errors and QuotaExceededError gracefully.
 */
import { useState, useCallback } from 'react';

type SetValue<T> = (value: T | ((prev: T) => T)) => void;

export interface UseLocalStorageOptions {
  /** Called when a storage error occurs (parse failure or QuotaExceededError). */
  onError?: (error: unknown) => void;
}

/**
 * Read and write a value from localStorage under `key`.
 * Falls back to `initialValue` when no stored value exists or parsing fails.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions
): [T, SetValue<T>] {
  const { onError } = options ?? {};

  const readValue = useCallback((): T => {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return initialValue;
      return JSON.parse(raw) as T;
    } catch (err) {
      onError?.(err);
      console.error(`[useLocalStorage] Failed to read key "${key}":`, err);
      return initialValue;
    }
  }, [key, initialValue, onError]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue: SetValue<T> = useCallback(
    (value) => {
      try {
        const next =
          typeof value === 'function'
            ? (value as (prev: T) => T)(storedValue)
            : value;
        localStorage.setItem(key, JSON.stringify(next));
        setStoredValue(next);
      } catch (err) {
        onError?.(err);
        if (err instanceof DOMException && err.name === 'QuotaExceededError') {
          console.error(
            `[useLocalStorage] QuotaExceededError writing key "${key}". Storage full.`,
            err
          );
        } else {
          console.error(
            `[useLocalStorage] Failed to write key "${key}":`,
            err
          );
        }
      }
    },
    [key, storedValue, onError]
  );

  return [storedValue, setValue];
}
