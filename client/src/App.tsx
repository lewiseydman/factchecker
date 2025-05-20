import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import SavedFacts from "@/pages/SavedFacts";
import Trending from "@/pages/Trending";
import Settings from "@/pages/Settings";
import { useAuth } from "@/hooks/useAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/history" component={isAuthenticated ? History : Dashboard} />
      <Route path="/saved" component={isAuthenticated ? SavedFacts : Dashboard} />
      <Route path="/trending" component={Trending} />
      <Route path="/settings" component={isAuthenticated ? Settings : Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-gray-50">
          <Header />
          <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Router />
          </main>
          <Footer />
          <Toaster />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
