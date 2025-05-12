import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import SchemaDesigner from "@/pages/schema";
import WorkflowBuilder from "@/pages/workflows";

// Lazy load other pages to improve initial load time
import { lazy, Suspense } from "react";
const FormBuilder = lazy(() => import("@/pages/forms"));

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/schema" component={SchemaDesigner} />
      <Route path="/forms">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading Form Builder...</div>}>
          <FormBuilder />
        </Suspense>
      </Route>
      <Route path="/workflows" component={WorkflowBuilder} />
      {/* Future routes will be added here */}
      <Route path="/dashboard">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
          <p>Dashboard functionality coming soon.</p>
        </div>
      </Route>
      <Route path="/roles">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Access Control</h1>
          <p>Role management functionality coming soon.</p>
        </div>
      </Route>
      <Route path="/data">
        <div className="container mx-auto p-6">
          <h1 className="text-3xl font-bold mb-6">Data Explorer</h1>
          <p>Data Explorer functionality coming soon.</p>
        </div>
      </Route>
      
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
