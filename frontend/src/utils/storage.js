export const KEYS = {
  USERS: 'sli_users',
  SESSION: 'sli_session',
  PLOTS: 'sli_plots',
  ENQUIRIES: 'sli_enquiries',
  VISITS: 'sli_visits',
  SAVED_PLOTS: 'sli_saved_plots',
  ANALYTICS: 'sli_analytics',
  GALLERY: 'sli_gallery',
};

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeItem(key) {
  try {
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
