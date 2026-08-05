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
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const [token, setToken] = useState<string | null>(
    () => localStorage.getItem("accessToken")
  );

  const [loading, setLoading] = useState(true);

  const roles: UserRole[] = user?.roles || [];

  const isAuthenticated = !!token && !!user;

  const hasRole = useCallback(
    (role: UserRole) => roles.includes(role),
    [roles]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        let accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          const refreshResponse = await authApi.refresh();
          const refreshedAccessToken = refreshResponse.data.accessToken;

          if (!refreshedAccessToken) {
            throw new Error("Failed to refresh authentication token");
          }

          accessToken = refreshedAccessToken;
          localStorage.setItem("accessToken", refreshedAccessToken);
        }

        setToken(accessToken);

        const meResponse = await authApi.me();
        setUser(meResponse.data);
      } catch (error) {
        localStorage.removeItem("accessToken");
        setToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login({
      email,
      password,
    });

    const accessToken = response.data.accessToken;
    const userData = response.data.user;

    localStorage.setItem("accessToken", accessToken);

    setToken(accessToken);
    setUser(userData);
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      await authApi.signup({
        name,
        email,
        password,
      });
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem("accessToken");
      setToken(null);
      setUser(null);
    }
  }, []);

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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}