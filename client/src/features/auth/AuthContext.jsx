import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authUserStorage, tokenStorage } from "@/lib/storage";
import { authService } from "@/features/auth/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authUserStorage.get());
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const syncUser = useCallback((nextUser) => {
    setUser(nextUser);

    if (nextUser) {
      authUserStorage.set(nextUser);
    } else {
      authUserStorage.clear();
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function bootstrapSession() {
      try {
        if (tokenStorage.get()) {
          const currentUser = await authService.getCurrentAdmin();
          if (isMounted) syncUser(currentUser);
          return;
        }

        const refreshedUser = await authService.refreshSession();
        if (isMounted) syncUser(refreshedUser);
      } catch {
        tokenStorage.clear();
        authUserStorage.clear();
        if (isMounted) syncUser(null);
      } finally {
        if (isMounted) setIsBootstrapping(false);
      }
    }

    bootstrapSession();

    return () => {
      isMounted = false;
    };
  }, [syncUser]);

  const loginAdmin = useCallback(
    async (credentials) => {
      const loggedInUser = await authService.loginAdmin(credentials);
      syncUser(loggedInUser);
      return loggedInUser;
    },
    [syncUser],
  );

  const logoutAdmin = useCallback(async () => {
    await authService.logoutAdmin();
    syncUser(null);
  }, [syncUser]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user && tokenStorage.get()),
      isAdmin: user?.role === "admin",
      isBootstrapping,
      loginAdmin,
      logoutAdmin,
    }),
    [isBootstrapping, loginAdmin, logoutAdmin, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}

