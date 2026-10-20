import { useEffect } from 'react';
import { getItem, setItem, KEYS } from '../utils/storage';

export function useAnalytics(page) {
  useEffect(() => {
    if (!page) return;
    const analytics = getItem(KEYS.ANALYTICS, {});
    analytics[page] = (analytics[page] || 0) + 1;
    setItem(KEYS.ANALYTICS, analytics);
  }, [page]);
}
