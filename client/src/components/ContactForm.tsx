import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const contactFormSchema = z.object({
  nome: z.string().min(1, "Il nome è obbligatorio"),
  email: z.string().email("Inserisci un'email valida"),
  telefono: z.string().optional(),
  indirizzoImmobile: z.string().min(1, "L'indirizzo dell'immobile è obbligatorio"),
  tipoRichiesta: z.enum(["vendita", "affitto"], {
    required_error: "Seleziona se si tratta di vendita o affitto",
  }),
  messaggio: z.string().optional(),
  privacy: z.boolean().refine((val) => val === true, {
    message: "Devi accettare la privacy policy",
  }),
  preferenzaContatto: z.enum(["email", "telefono", "whatsapp"], {
    required_error: "Seleziona una preferenza di contatto",
  }),
  website: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

interface ContactFormProps {
  source: "contatti" | "immobile" | "blog";
  contextId?: string;
}

export default function ContactForm({ source, contextId }: ContactFormProps) {
  const { toast } = useToast();
  
  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nome: "",
      email: "",
      telefono: "",
      indirizzoImmobile: "",
      tipoRichiesta: undefined,
      messaggio: "",
      privacy: false,
      preferenzaContatto: "email",
      website: "",
    },
  });

  const submitLead = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("POST", "/api/lead", data);
      return await response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Messaggio inviato!",
        description: data.message || "Ti contatteremo presto.",
      });
      form.reset({
        nome: "",
        email: "",
        telefono: "",
        indirizzoImmobile: "",
        tipoRichiesta: undefined,
        messaggio: "",
        privacy: false,
        preferenzaContatto: "email",
        website: "",
      }, { keepErrors: false });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Errore",
        description: error.message || "Si è verificato un errore. Riprova più tardi.",
      });
    },
  });

  const onSubmit = (data: ContactFormData) => {
    let messaggioCompleto = `Indirizzo immobile: ${data.indirizzoImmobile}`;
    messaggioCompleto += `\nTipo richiesta: ${data.tipoRichiesta === "vendita" ? "Vendita" : "Affitto"}`;
    
    if (data.messaggio) {
      messaggioCompleto += `\n\nMessaggio: ${data.messaggio}`;
    }
    
    if (data.telefono) {
      messaggioCompleto += `\n\nTelefono: ${data.telefono}`;
    }
    
    messaggioCompleto += `\nPreferenza di contatto: ${data.preferenzaContatto}`;
    
    const leadData = {
      nome: data.nome,
      email: data.email,
      messaggio: messaggioCompleto,
      fonte: source,
      contextId: contextId || undefined,
      newsletter: false,
      website: data.website || "",
    };
    
    submitLead.mutate(leadData);
  };

  return (
    <Card className="p-6 md:p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome e Cognome *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Mario Rossi"
                    data-testid="input-nome"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="mario.rossi@email.com"
                    data-testid="input-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefono"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Telefono</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="+39 348 123 4567"
                    data-testid="input-telefono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="indirizzoImmobile"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Indirizzo dell'Immobile *</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Via Roma 123, Milano"
                    data-testid="input-indirizzo-immobile"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tipoRichiesta"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo di Richiesta *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2"
                    data-testid="radiogroup-tipo-richiesta"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="vendita"
                        id="tipo-vendita"
                        data-testid="radio-vendita"
                      />
                      <Label htmlFor="tipo-vendita" className="font-normal cursor-pointer">
                        Vendita
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="affitto"
                        id="tipo-affitto"
                        data-testid="radio-affitto"
                      />
                      <Label htmlFor="tipo-affitto" className="font-normal cursor-pointer">
                        Affitto
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="messaggio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Messaggio (facoltativo)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Scrivici le tue esigenze, ti contatteremo al più presto..."
                    rows={5}
                    data-testid="input-messaggio"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="preferenzaContatto"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preferenza di Contatto *</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-2"
                    data-testid="radiogroup-preferenza"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="email"
                        id="pref-email"
                        data-testid="radio-email"
                      />
                      <Label htmlFor="pref-email" className="font-normal cursor-pointer">
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="telefono"
                        id="pref-telefono"
                        data-testid="radio-telefono"
                      />
                      <Label htmlFor="pref-telefono" className="font-normal cursor-pointer">
                        Telefono
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="whatsapp"
                        id="pref-whatsapp"
                        data-testid="radio-whatsapp"
                      />
                      <Label htmlFor="pref-whatsapp" className="font-normal cursor-pointer">
                        WhatsApp
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="privacy"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    data-testid="checkbox-privacy"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="font-normal cursor-pointer">
                    Accetto la{" "}
                    <a
                      href="/privacy"
                      target="_blank"
                      className="text-primary hover:underline"
                      data-testid="link-privacy"
                    >
                      privacy policy
                    </a>{" "}
                    *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="website"
            render={({ field }) => (
              <FormItem className="absolute opacity-0 pointer-events-none" aria-hidden="true">
                <FormLabel>Website</FormLabel>
                <FormControl>
                  <Input
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={submitLead.isPending}
            data-testid="button-submit-contact"
          >
            {submitLead.isPending ? "Invio in corso..." : "Invia Messaggio"}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
