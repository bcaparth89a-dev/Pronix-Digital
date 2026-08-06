const ACCESS_TOKEN_KEY = "pronix_access_token";
const AUTH_USER_KEY = "pronix_auth_user";

export const tokenStorage = {
  get() {
    return window.localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token) {
    window.localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear() {
    window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
};

export const authUserStorage = {
  get() {
    const value = window.localStorage.getItem(AUTH_USER_KEY);
    return value ? JSON.parse(value) : null;
  },
  set(user) {
    window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  },
  clear() {
    window.localStorage.removeItem(AUTH_USER_KEY);
  },
};
