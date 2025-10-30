import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Loader2, Search, X, Eye } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import type { Lead } from "@shared/schema";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function LeadListTable() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [leadToView, setLeadToView] = useState<Lead | null>(null);

  const { data: leads, isLoading, error } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return await apiRequest("DELETE", `/api/admin/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      toast({
        title: "Lead eliminato",
        description: "Il lead è stato eliminato con successo",
      });
      setDeleteDialogOpen(false);
      setLeadToDelete(null);
    },
    onError: (error: any) => {
      toast({
        title: "Errore",
        description: error.message || "Errore nell'eliminazione del lead",
        variant: "destructive",
      });
    },
  });

  const filteredLeads = useMemo(() => {
    if (!leads) return [];

    return leads.filter((lead) => {
      const searchLower = searchTerm.toLowerCase();
      return (
        lead.nome.toLowerCase().includes(searchLower) ||
        lead.email.toLowerCase().includes(searchLower) ||
        (lead.fonte && lead.fonte.toLowerCase().includes(searchLower))
      );
    });
  }, [leads, searchTerm]);

  const handleDelete = (lead: Lead) => {
    setLeadToDelete(lead);
    setDeleteDialogOpen(true);
  };

  const handleView = (lead: Lead) => {
    setLeadToView(lead);
    setViewDialogOpen(true);
  };

  const confirmDelete = () => {
    if (leadToDelete) {
      deleteMutation.mutate(leadToDelete.id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12" data-testid="loading-leads">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Caricamento lead...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-destructive/10 p-4 text-destructive" data-testid="error-leads">
        <p className="font-medium">Errore nel caricamento dei lead</p>
        <p className="text-sm mt-1">
          {error instanceof Error ? error.message : "Si è verificato un errore imprevisto"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[200px]">
          <label htmlFor="search" className="text-sm font-medium mb-2 block">
            Cerca lead
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Cerca per nome, email o fonte..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-9"
              data-testid="input-search"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7"
                onClick={() => setSearchTerm("")}
                data-testid="button-clear-search"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {searchTerm && (
          <Button
            variant="outline"
            onClick={() => setSearchTerm("")}
            data-testid="button-reset-filters"
          >
            Azzera filtri
          </Button>
        )}
      </div>

      {filteredLeads.length === 0 && leads && leads.length > 0 ? (
        <div className="text-center py-12" data-testid="no-results">
          <p className="text-muted-foreground">Nessun lead trovato con i filtri selezionati</p>
          <Button
            variant="ghost"
            onClick={() => setSearchTerm("")}
            className="mt-2"
          >
            Azzera filtri
          </Button>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="text-center py-12" data-testid="empty-leads">
          <p className="text-muted-foreground">Nessun lead ricevuto</p>
          <p className="text-sm text-muted-foreground mt-1">
            I contatti ricevuti tramite il modulo appariranno qui
          </p>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="w-32">Fonte</TableHead>
                <TableHead className="w-24">Newsletter</TableHead>
                <TableHead className="w-48">Data</TableHead>
                <TableHead className="text-right w-32">Azioni</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell className="font-medium" data-testid={`text-lead-name-${lead.id}`}>
                    {lead.nome}
                  </TableCell>
                  <TableCell data-testid={`text-lead-email-${lead.id}`}>
                    <a href={`mailto:${lead.email}`} className="text-primary hover:underline">
                      {lead.email}
                    </a>
                  </TableCell>
                  <TableCell data-testid={`text-lead-fonte-${lead.id}`}>
                    {lead.fonte ? (
                      <Badge variant="outline" className="text-xs">
                        {lead.fonte}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell data-testid={`text-lead-newsletter-${lead.id}`}>
                    <Badge variant={lead.newsletter ? "default" : "secondary"} className="text-xs">
                      {lead.newsletter ? "Sì" : "No"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground" data-testid={`text-lead-date-${lead.id}`}>
                    {format(new Date(lead.createdAt), "dd MMM yyyy, HH:mm", { locale: it })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleView(lead)}
                        data-testid={`button-view-lead-${lead.id}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(lead)}
                        disabled={deleteMutation.isPending}
                        data-testid={`button-delete-lead-${lead.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare il lead di "{leadToDelete?.nome}"? Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="button-cancel-delete">
              Annulla
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              data-testid="button-confirm-delete"
            >
              {deleteMutation.isPending ? "Eliminazione..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Dettagli Lead</DialogTitle>
          </DialogHeader>
          {leadToView && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Nome</label>
                  <p className="mt-1" data-testid="dialog-lead-name">{leadToView.nome}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Email</label>
                  <p className="mt-1" data-testid="dialog-lead-email">
                    <a href={`mailto:${leadToView.email}`} className="text-primary hover:underline">
                      {leadToView.email}
                    </a>
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Fonte</label>
                  <p className="mt-1" data-testid="dialog-lead-fonte">
                    {leadToView.fonte || "-"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Newsletter</label>
                  <p className="mt-1" data-testid="dialog-lead-newsletter">
                    {leadToView.newsletter ? "Sì" : "No"}
                  </p>
                </div>
                {leadToView.contextId && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Context ID</label>
                    <p className="mt-1 text-xs font-mono" data-testid="dialog-lead-context">
                      {leadToView.contextId}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="mt-1" data-testid="dialog-lead-date">
                    {format(new Date(leadToView.createdAt), "dd MMMM yyyy, HH:mm", { locale: it })}
                  </p>
                </div>
                {leadToView.ip && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">IP</label>
                    <p className="mt-1 text-xs font-mono" data-testid="dialog-lead-ip">
                      {leadToView.ip}
                    </p>
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-medium text-muted-foreground">Messaggio</label>
                <div className="mt-2 p-4 bg-muted rounded-md" data-testid="dialog-lead-message">
                  <p className="whitespace-pre-wrap">{leadToView.messaggio}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
