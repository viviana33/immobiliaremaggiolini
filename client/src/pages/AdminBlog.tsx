import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { PostListTable } from "@/components/blog/PostListTable";

function AdminBlogContent() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/dashboard")}
            data-testid="button-back-dashboard"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Admin
          </Button>
          <span>/</span>
          <span>Blog</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Gestione Blog
            </h1>
            <p className="text-muted-foreground">
              Gestisci gli articoli del blog
            </p>
          </div>
          <Button
            onClick={() => setLocation("/admin/blog/nuovo")}
            data-testid="button-nuovo-post"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nuovo Articolo
          </Button>
        </div>

        {/* TODO: Implementare logica di caricamento e gestione articoli */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco Articoli</CardTitle>
          </CardHeader>
          <CardContent>
            <PostListTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminBlog() {
  return (
    <ProtectedRoute>
      <AdminBlogContent />
    </ProtectedRoute>
  );
}
