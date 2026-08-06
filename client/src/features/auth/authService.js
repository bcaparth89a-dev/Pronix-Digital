import { apiClient } from "@/services/apiClient";
import { authUserStorage, tokenStorage } from "@/lib/storage";

function persistSession({ accessToken, user }) {
  tokenStorage.set(accessToken);
  authUserStorage.set(user);
  return user;
}

export const authService = {
  async loginAdmin(credentials) {
    const response = await apiClient.post("/auth/admin/login", credentials);
    return persistSession(response.data.data);
  },

  async refreshSession() {
    const response = await apiClient.post("/auth/admin/refresh");
    return persistSession(response.data.data);
  },

  async getCurrentAdmin() {
    const response = await apiClient.get("/auth/admin/me");
    const user = response.data.data.user;
    authUserStorage.set(user);
    return user;
  },

  async logoutAdmin() {
    try {
      await apiClient.post("/auth/admin/logout");
    } finally {
      tokenStorage.clear();
      authUserStorage.clear();
    }
  },
};

