import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SchemaDesigner from "@/pages/schema";
import WorkflowBuilder from "@/pages/workflows";
import RoleManager from "@/pages/roles";
import DataExplorer from "@/pages/data";
import Dashboard from "@/pages/dashboard";

// Auth pages
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";

// Lazy load other pages to improve initial load time
import { lazy, Suspense } from "react";
const FormBuilder = lazy(() => import("@/pages/forms"));

function Router() {
  return (
    <Switch>
      {/* Auth routes */}
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      
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
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
