import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";
import { PostForm } from "@/components/blog/PostForm";

function AdminBlogFormContent() {
  const { id } = useParams<{ id?: string }>();
  const [, setLocation] = useLocation();
  const isEdit = Boolean(id);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto">
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/admin/blog")}
            data-testid="button-back-blog"
          >
            Blog
          </Button>
          <span>/</span>
          <span>{isEdit ? "Modifica" : "Nuovo"}</span>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold" data-testid="text-page-title">
            {isEdit ? "Modifica Articolo" : "Nuovo Articolo"}
          </h1>
          <Button
            variant="outline"
            onClick={() => setLocation("/admin/blog")}
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna all'elenco
          </Button>
        </div>

        {/* TODO: Implementare logica di caricamento e salvataggio articolo */}
        <Card>
          <CardHeader>
            <CardTitle>Dettagli Articolo</CardTitle>
          </CardHeader>
          <CardContent>
            <PostForm postId={id} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminBlogForm() {
  return (
    <ProtectedRoute>
      <AdminBlogFormContent />
    </ProtectedRoute>
  );
}
