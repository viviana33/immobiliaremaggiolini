import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { apiRequest } from "@/lib/queryClient";

const subscriptionFormSchema = z.object({
  email: z.string().email("Inserisci un indirizzo email valido"),
  nome: z.string().optional(),
  blogUpdates: z.boolean().default(true),
  newListings: z.boolean().default(false),
  source: z.string().optional(),
});

type SubscriptionFormData = z.infer<typeof subscriptionFormSchema>;

export default function SubscriptionBox() {
  const [, setLocation] = useLocation();
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      email: "",
      nome: "",
      blogUpdates: true,
      newListings: false,
      source: "blog",
    },
  });

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      const response = await apiRequest("POST", "/api/subscribe", data);
      return response.json();
    },
    onSuccess: (data, variables) => {
      const blogUpdates = variables.blogUpdates ?? true;
      const newListings = variables.newListings ?? false;
      setLocation(`/grazie?lead=ok&source=blog&email=${encodeURIComponent(variables.email)}&blogUpdates=${blogUpdates}&newListings=${newListings}`);
    },
    onError: (error: any) => {
      setSubmitStatus("error");
      setErrorMessage(
        error?.message || "Si è verificato un errore. Riprova più tardi."
      );
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    setSubmitStatus("idle");
    subscribeMutation.mutate(data);
  };

  return (
    <Card className="p-6 md:p-8" data-testid="subscription-box">
      <div className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-md bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-serif font-semibold text-xl md:text-2xl text-foreground">
              Ricevi i nuovi articoli
            </h3>
          </div>
          <p className="text-muted-foreground text-sm md:text-base">
            Iscriviti alla newsletter per non perdere i nostri contenuti sul mondo immobiliare.
          </p>
        </div>

        {submitStatus === "success" && (
          <Alert className="border-green-500/50 bg-green-50 dark:bg-green-950/20" data-testid="alert-success">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Iscrizione ricevuta!</strong> Controlla la tua email per confermare
              l'iscrizione (verifica anche lo spam). Riceverai un link per completare
              il processo.
            </AlertDescription>
          </Alert>
        )}

        {submitStatus === "error" && (
          <Alert variant="destructive" data-testid="alert-error">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email *</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="tua@email.it"
                      {...field}
                      data-testid="input-email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome (opzionale)</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Il tuo nome"
                      {...field}
                      data-testid="input-name"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="newListings"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="checkbox-new-listings"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Mandami anche le notifiche sui nuovi immobili
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={subscribeMutation.isPending}
              data-testid="button-subscribe"
            >
              {subscribeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iscrizione in corso...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Iscriviti
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Riceverai una email di conferma per completare l'iscrizione (double opt-in).
              Potrai disiscriverti in qualsiasi momento.
            </p>
          </form>
        </Form>
      </div>
    </Card>
  );
}
