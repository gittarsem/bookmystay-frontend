import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

import type { User, UserRole } from "@/types";
import { authApi } from "@/api";

interface AuthContextType {
  user: User | null;
  token: string | null;
  roles: UserRole[];
  isAuthenticated: boolean;
  loading: boolean;

  login: (
    email: string,
    password: string
  ) => Promise<void>;

  register: (
    name: string,
    email: string,
    password: string
  ) => Promise<void>;

  logout: () => Promise<void>;

  hasRole: (
    role: UserRole
  ) => boolean;

  refreshUser: () => Promise<void>;
}

const AuthContext =
  createContext<AuthContextType | undefined>(
    undefined
  );

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [user, setUser] =
    useState<User | null>(null);

  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          "accessToken"
        )
    );

  const [loading, setLoading] =
    useState(true);

  const roles: UserRole[] =
    user?.roles || [];

  const isAuthenticated =
    !!token && !!user;

  /*
   * =========================================================
   * CHECK ROLE
   * =========================================================
   */

  const hasRole = useCallback(
    (role: UserRole) =>
      roles.includes(role),
    [roles]
  );

  /*
   * =========================================================
   * REFRESH CURRENT USER
   * =========================================================
   *
   * Fetches the latest user from backend.
   *
   * Important for things like:
   *
   * OWNER → GUEST
   *
   * because the role must come from backend.
   */

  const refreshUser =
    useCallback(async () => {
      const response =
        await authApi.me();

      setUser(response.data);
    }, []);

  /*
   * =========================================================
   * INITIALIZE AUTH
   * =========================================================
   */

  useEffect(() => {
    const initializeAuth =
      async () => {
        try {
          let accessToken =
            localStorage.getItem(
              "accessToken"
            );

          /*
           * No access token?
           * Try refresh token.
           */

          if (!accessToken) {
            const refreshResponse =
              await authApi.refresh();

            const refreshedAccessToken =
              refreshResponse.data
                .accessToken;

            if (
              !refreshedAccessToken
            ) {
              throw new Error(
                "Failed to refresh authentication token"
              );
            }

            accessToken =
              refreshedAccessToken;

            localStorage.setItem(
              "accessToken",
              refreshedAccessToken
            );
          }

          setToken(accessToken);

          /*
           * Load current user.
           */

          const meResponse =
            await authApi.me();

          setUser(
            meResponse.data
          );
        } catch (error) {
          console.error(
            "Failed to initialize authentication:",
            error
          );

          localStorage.removeItem(
            "accessToken"
          );

          setToken(null);
          setUser(null);
        } finally {
          setLoading(false);
        }
      };

    initializeAuth();
  }, []);

  /*
   * =========================================================
   * LOGIN
   * =========================================================
   */

  const login = useCallback(
    async (
      email: string,
      password: string
    ) => {
      const response =
        await authApi.login({
          email,
          password,
        });

      const accessToken =
        response.data
          .accessToken;

      const userData =
        response.data.user;

      localStorage.setItem(
        "accessToken",
        accessToken
      );

      setToken(accessToken);
      setUser(userData);
    },
    []
  );

  /*
   * =========================================================
   * REGISTER
   * =========================================================
   */

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string
    ) => {
      await authApi.signup({
        name,
        email,
        password,
      });
    },
    []
  );

  /*
   * =========================================================
   * LOGOUT
   * =========================================================
   */

  const logout = useCallback(
    async () => {
      try {
        await authApi.logout();
      } finally {
        localStorage.removeItem(
          "accessToken"
        );

        setToken(null);
        setUser(null);
      }
    },
    []
  );

  /*
   * =========================================================
   * PROVIDER
   * =========================================================
   */

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        roles,
        isAuthenticated,
        loading,

        login,
        register,
        logout,

        hasRole,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/*
 * ===========================================================
 * USE AUTH
 * ===========================================================
 */

export function useAuth() {
  const context =
    useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within AuthProvider"
    );
  }

  return context;
}