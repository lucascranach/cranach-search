
export const querify = (obj: Record<string, string | number>) => Object.entries(obj).map(([name, value]) => `${name}=${encodeURIComponent(value)}`).join('&');

export const apiConfiguration = {
  host: import.meta.env.VITE_SEARCH_API_URL,
  authUser: import.meta.env.VITE_AUTH_USER,
  authPass: import.meta.env.VITE_AUTH_PASS,
};

export default {};
