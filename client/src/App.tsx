import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/contexts/ThemeContext";
import NotFound from "@/pages/not-found";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Dashboard from "@/pages/Dashboard";
import History from "@/pages/History";
import SavedFacts from "@/pages/SavedFacts";
import Settings from "@/pages/Settings";
import Methodology from "@/pages/Methodology";
import Subscription from "@/pages/Subscription";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import Contact from "@/pages/Contact";
import ContextAware from "@/pages/ContextAware";
import HoldingPage from "@/pages/HoldingPage";
import { useAuth } from "@/hooks/useAuth";
import { useDevAuth } from "@/hooks/useDevAuth";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const { isDevAuthenticated, isLoading: isDevLoading, authenticate } = useDevAuth();
  
  // Show loading while checking authentication states
  if (isLoading || isDevLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Show holding page if not dev authenticated
  if (!isDevAuthenticated) {
    return <HoldingPage onAuthenticated={authenticate} />;
  }

  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/history" component={isAuthenticated ? History : Dashboard} />
      <Route path="/saved" component={isAuthenticated ? SavedFacts : Dashboard} />

      <Route path="/context-aware" component={ContextAware} />
      <Route path="/methodology" component={Methodology} />
      <Route path="/subscription" component={Subscription} />
      <Route path="/settings" component={isAuthenticated ? Settings : Dashboard} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/contact" component={Contact} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors">
            <Header />
            <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <Router />
            </main>
            <Footer />
            <Toaster />
          </div>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
