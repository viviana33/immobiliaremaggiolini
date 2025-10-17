import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Proprieta from "@/pages/Proprieta";
import Immobili from "@/pages/Immobili";
import ImmobileDettaglio from "@/pages/ImmobileDettaglio";
import Blog from "@/pages/Blog";
import ChiSiamo from "@/pages/ChiSiamo";
import Contatti from "@/pages/Contatti";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImmobili from "@/pages/AdminImmobili";
import AdminImmobileForm from "@/pages/AdminImmobileForm";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/admin/immobili" component={() => (
        <ProtectedRoute>
          <AdminImmobili />
        </ProtectedRoute>
      )} />
      <Route path="/admin/immobili/nuovo" component={() => (
        <ProtectedRoute>
          <AdminImmobileForm />
        </ProtectedRoute>
      )} />
      <Route path="/admin/immobili/:id" component={() => (
        <ProtectedRoute>
          <AdminImmobileForm />
        </ProtectedRoute>
      )} />
      <Route path="/">
        {() => (
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/proprieta" component={Proprieta} />
                <Route path="/immobili" component={Immobili} />
                <Route path="/immobile/:slug" component={ImmobileDettaglio} />
                <Route path="/blog" component={Blog} />
                <Route path="/chi-siamo" component={ChiSiamo} />
                <Route path="/contatti" component={Contatti} />
                <Route component={NotFound} />
              </Switch>
            </main>
            <Footer />
          </div>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
