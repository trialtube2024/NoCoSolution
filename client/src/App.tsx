import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { Navigation } from "@/components/navigation";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SchemaDesigner from "@/pages/schema";
import WorkflowBuilder from "@/pages/workflows";
import RoleManager from "@/pages/roles";
import DataExplorer from "@/pages/data";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";

// Auth pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import ResetPassword from "@/pages/auth/reset-password";

// Lazy load other pages to improve initial load time
import { lazy, Suspense } from "react";
const FormBuilder = lazy(() => import("@/pages/forms"));

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/reset-password" component={ResetPassword} />
      
      {/* App routes */}
      <Route path="/" component={Home} />
      <Route path="/schema" component={SchemaDesigner} />
      <Route path="/forms">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Form Builder...</div>}>
          <FormBuilder />
        </Suspense>
      </Route>
      <Route path="/workflows" component={WorkflowBuilder} />
      <Route path="/roles" component={RoleManager} />
      <Route path="/data" component={DataExplorer} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/profile" component={Profile} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [location] = useLocation();
  
  // Check if current route is an auth route
  // location in wouter is returned as a string
  const isAuthRoute = 
    location.startsWith("/auth/login") || 
    location.startsWith("/auth/register") || 
    location.startsWith("/auth/forgot-password") || 
    location.startsWith("/auth/reset-password");
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <div className="min-h-screen bg-background flex flex-col">
            <Toaster />
            {!isAuthRoute && <Navigation />}
            <main className="flex-1">
              <Router />
            </main>
          </div>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
