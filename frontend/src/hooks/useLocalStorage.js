import { useState, useCallback } from 'react';
import { getItem, setItem } from '../utils/storage';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    const item = getItem(key);
    return item !== null ? item : initialValue;
  });

  const setValue = useCallback((value) => {
    setStoredValue((prev) => {
      const newValue = typeof value === 'function' ? value(prev) : value;
      setItem(key, newValue);
      return newValue;
    });
  }, [key]);

  return [storedValue, setValue];
}
