export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Derive origin (scheme://host:port) from API base url (scheme://host:port/api)
export const API_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');

