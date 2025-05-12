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
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const TOKEN_REFRESH_INTERVAL = 14 * 60 * 1000; // Refresh 1 minute before expiry (15 min tokens)

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const login = async (credentials) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) throw new Error('Login failed');
      
      const { user, token } = await response.json();
      localStorage.setItem('token', token);
      setUser(user);
      return user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) return;

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${currentToken}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) throw new Error('Token refresh failed');

      const { token } = await response.json();
      localStorage.setItem('token', token);
    } catch (error) {
      console.error('Token refresh error:', error);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    navigate('/login');
  };

  useEffect(() => {
    // Initial auth check
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!response.ok) throw new Error('Auth check failed');
        
        const userData = await response.json();
        setUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        logout();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Set up token refresh interval
    const refreshInterval = setInterval(refreshToken, TOKEN_REFRESH_INTERVAL);
    return () => clearInterval(refreshInterval);
  }, []);

  return { user, loading, login, logout };
};
