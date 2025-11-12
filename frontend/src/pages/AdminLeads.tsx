import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";
import { LeadListTable } from "@/components/lead/LeadListTable";

function AdminLeadsContent() {
  const [, setLocation] = useLocation();

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
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
          <span>Lead</span>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2" data-testid="text-page-title">
              Gestione Lead
            </h1>
            <p className="text-muted-foreground">
              Visualizza e gestisci i contatti ricevuti
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Elenco Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <LeadListTable />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function AdminLeads() {
  return (
    <ProtectedRoute>
      <AdminLeadsContent />
    </ProtectedRoute>
  );
}
