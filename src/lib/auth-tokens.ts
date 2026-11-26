const TOKEN_KEY = 'sb_at';
const EXPIRY_KEY = 'sb_ae';

export const tokenStorage = {
  get(): string | null {
    if (typeof window === 'undefined') return null;

    const tryStore = (store: Storage) => {
      const token = store.getItem(TOKEN_KEY);
      const expiry = store.getItem(EXPIRY_KEY);
      if (token && expiry && Date.now() < parseInt(expiry)) return token;
      return null;
    };

    return tryStore(sessionStorage) || tryStore(localStorage);
  },

  set(token: string): void {
    if (typeof window === 'undefined') return;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const expiresInMs = (payload.exp * 1000) - Date.now();
      if (expiresInMs <= 0) return;
      const expiry = (Date.now() + expiresInMs).toString();
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRY_KEY, expiry);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, expiry);
    } catch {
      const expiry = (Date.now() + 7 * 24 * 60 * 60 * 1000).toString();
      sessionStorage.setItem(TOKEN_KEY, token);
      sessionStorage.setItem(EXPIRY_KEY, expiry);
      localStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(EXPIRY_KEY, expiry);
    }
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    [sessionStorage, localStorage].forEach((store) => {
      store.removeItem(TOKEN_KEY);
      store.removeItem(EXPIRY_KEY);
    });
  },
};