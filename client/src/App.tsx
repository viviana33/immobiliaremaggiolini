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
import BlogDettaglio from "@/pages/BlogDettaglio";
import ChiSiamo from "@/pages/ChiSiamo";
import Contatti from "@/pages/Contatti";
import Preferenze from "@/pages/Preferenze";
import Grazie from "@/pages/Grazie";
import Privacy from "@/pages/Privacy";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";
import AdminImmobili from "@/pages/AdminImmobili";
import AdminImmobileForm from "@/pages/AdminImmobileForm";
import AdminBlog from "@/pages/AdminBlog";
import AdminBlogForm from "@/pages/AdminBlogForm";
import AdminLeads from "@/pages/AdminLeads";
import NotFound from "@/pages/not-found";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import OrganizationSchema from "@/components/OrganizationSchema";

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/admin" component={Login} />
      <Route path="/admin/dashboard">
        {() => (
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        )}
      </Route>
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
      <Route path="/admin/immobili" component={() => (
        <ProtectedRoute>
          <AdminImmobili />
        </ProtectedRoute>
      )} />
      <Route path="/admin/blog/nuovo" component={() => (
        <ProtectedRoute>
          <AdminBlogForm />
        </ProtectedRoute>
      )} />
      <Route path="/admin/blog/:id" component={() => (
        <ProtectedRoute>
          <AdminBlogForm />
        </ProtectedRoute>
      )} />
      <Route path="/admin/blog" component={() => (
        <ProtectedRoute>
          <AdminBlog />
        </ProtectedRoute>
      )} />
      <Route path="/admin/lead" component={() => (
        <ProtectedRoute>
          <AdminLeads />
        </ProtectedRoute>
      )} />
      <Route>
        {() => (
          <div className="min-h-screen flex flex-col">
            <OrganizationSchema />
            <Navbar />
            <main className="flex-1">
              <Switch>
                <Route path="/proprieta" component={Proprieta} />
                <Route path="/immobili" component={Immobili} />
                <Route path="/immobile/:slug" component={ImmobileDettaglio} />
                <Route path="/blog/:slug" component={BlogDettaglio} />
                <Route path="/blog" component={Blog} />
                <Route path="/chi-siamo" component={ChiSiamo} />
                <Route path="/contatti" component={Contatti} />
                <Route path="/preferenze" component={Preferenze} />
                <Route path="/privacy" component={Privacy} />
                <Route path="/grazie" component={Grazie} />
                <Route path="/" component={Home} />
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
