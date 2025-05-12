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

  const login = (userData: User) => {
    // Save user data to localStorage
    localStorage.setItem("user", JSON.stringify(userData));
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
  
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  
  return context;
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