import { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { useLocation } from "wouter";

interface User {
  id: string;
  username: string;
  email?: string;
  fullName?: string;
  role?: string | null;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Public routes that don't require authentication
const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password"
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    // Check if user data exists in localStorage
    const storedUser = localStorage.getItem("user");

    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setUser(userData);
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
        localStorage.removeItem("user");
      }
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    // Check if current route requires auth
    if (!isLoading && !user) {
      const isPublicRoute = publicRoutes.some(route => location.startsWith(route));

      if (!isPublicRoute && location !== "/") {
        // Redirect to login if not authenticated and not on a public route
        setLocation("/auth/login");
      }
    }
  }, [user, isLoading, location, setLocation]);

  const login = (userData: User, remember: boolean = false) => {
    // Save user data to storage based on remember preference
    const storage = remember ? localStorage : sessionStorage;
    storage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    // Remove user data from localStorage
    localStorage.removeItem("user");
    setUser(null);
    setLocation("/auth/login");
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    isLoading
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Set up token refresh interval (1 minute before expiry)
    const refreshInterval = setInterval(async () => {
      if (!context.user) return;

      try {
        setRefreshing(true);
        const response = await fetch('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`
          }
        });

        if (!response.ok) throw new Error('Token refresh failed');

        const { token } = await response.json();
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, token }));
      } catch (error) {
        console.error('Token refresh error:', error);
        context.logout();
      } finally {
        setRefreshing(false);
      }
    }, 14 * 60 * 1000); // Refresh every 14 minutes (1 minute before 15-minute expiry)

    return () => clearInterval(refreshInterval);
  }, [context.user]);

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  const loginWithGoogle = async () => {
    try {
      const response = await fetch('/api/auth/google');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Google login error:', error);
    }
  };

  const loginWithGithub = async () => {
    try {
      const response = await fetch('/api/auth/github');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('GitHub login error:', error);
    }
  };

  return { ...context, refreshing, loginWithGoogle, loginWithGithub };
}

// Function to get the auth token for API requests
export function getAuthToken() {
  const storedUser = localStorage.getItem("user");

  if (!storedUser) {
    return null;
  }

  try {
    const userData = JSON.parse(storedUser);
    return userData.token;
  } catch (error) {
    console.error("Error parsing user data for token:", error);
    return null;
  }
}

// API request function with authentication
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = getAuthToken();

  // Create headers object
  const newHeaders = new Headers(options.headers);
  newHeaders.set("Content-Type", "application/json");

  if (token) {
    newHeaders.set("Authorization", `Bearer ${token}`);
  }

  return fetch(url, {
    ...options,
    headers: newHeaders
  });
}