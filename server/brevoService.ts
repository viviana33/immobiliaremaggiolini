import { ContactsApi, ContactsApiApiKeys, CreateDoiContact, UpdateContact, TransactionalEmailsApi, TransactionalEmailsApiApiKeys, SendSmtpEmail } from "@getbrevo/brevo";

export interface BrevoContactAttributes {
  FIRSTNAME?: string;
  BLOG_UPDATES?: boolean;
  NEW_LISTINGS?: boolean;
}

export interface CreateContactParams {
  email: string;
  attributes?: BrevoContactAttributes;
  listIds: number[];
  templateId?: number;
  redirectionUrl?: string;
}

export interface UpdateContactParams {
  email: string;
  attributes: BrevoContactAttributes;
}

export interface SendEmailParams {
  to: { email: string; name?: string }[];
  subject: string;
  htmlContent: string;
  sender?: { email: string; name: string };
}

class BrevoService {
  private apiInstance: ContactsApi;
  private emailApiInstance: TransactionalEmailsApi;
  private apiKey: string;
  private defaultTemplateId: number;
  private defaultListId: number;

  constructor() {
    this.apiKey = process.env.BREVO_API_KEY || "";
    
    // TODO: Configurare questi valori dopo aver creato template e lista in Brevo
    this.defaultTemplateId = parseInt(process.env.BREVO_TEMPLATE_ID || "0");
    this.defaultListId = parseInt(process.env.BREVO_LIST_ID || "0");

    if (!this.apiKey) {
      throw new Error("BREVO_API_KEY non configurata");
    }

    this.apiInstance = new ContactsApi();
    this.apiInstance.setApiKey(ContactsApiApiKeys.apiKey, this.apiKey);

    this.emailApiInstance = new TransactionalEmailsApi();
    this.emailApiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, this.apiKey);
  }

  async createContactWithDoubleOptIn(params: CreateContactParams): Promise<void> {
    const createDoiContact = new CreateDoiContact();
    
    createDoiContact.email = params.email;
    createDoiContact.attributes = params.attributes || {};
    createDoiContact.includeListIds = params.listIds;
    createDoiContact.templateId = params.templateId || this.defaultTemplateId;
    
    if (params.redirectionUrl) {
      createDoiContact.redirectionUrl = params.redirectionUrl;
    }

    try {
      await this.apiInstance.createDoiContact(createDoiContact);
    } catch (error: any) {
      console.error("Errore Brevo createDoiContact:", error.response?.body || error.message);
      throw new Error("Errore nell'invio dell'email di conferma");
    }
  }

  async updateContact(params: UpdateContactParams): Promise<void> {
    const updateContactData = new UpdateContact();
    updateContactData.attributes = params.attributes;

    try {
      await this.apiInstance.updateContact(params.email, updateContactData);
    } catch (error: any) {
      console.error("Errore Brevo updateContact:", error.response?.body || error.message);
      
      // Se il contatto non esiste, potremmo volerlo creare
      if (error.response?.status === 404) {
        throw new Error("Contatto non trovato");
      }
      
      throw new Error("Errore nell'aggiornamento del contatto");
    }
  }

  async getContact(email: string): Promise<any> {
    try {
      const response = await this.apiInstance.getContactInfo(email);
      return response.body;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      console.error("Errore Brevo getContact:", error.response?.body || error.message);
      throw new Error("Errore nel recupero del contatto");
    }
  }

  async sendTransactionalEmail(params: SendEmailParams): Promise<void> {
    const sendSmtpEmail = new SendSmtpEmail();
    
    sendSmtpEmail.to = params.to;
    sendSmtpEmail.subject = params.subject;
    sendSmtpEmail.htmlContent = params.htmlContent;
    
    if (params.sender) {
      sendSmtpEmail.sender = params.sender;
    } else {
      sendSmtpEmail.sender = {
        email: process.env.BREVO_SENDER_EMAIL || "info@immobiliaremaggiolini.it",
        name: process.env.BREVO_SENDER_NAME || "Immobiliare Maggiolini"
      };
    }

    try {
      await this.emailApiInstance.sendTransacEmail(sendSmtpEmail);
    } catch (error: any) {
      console.error("Errore Brevo sendTransactionalEmail:", error.response?.body || error.message);
      throw new Error("Errore nell'invio dell'email");
    }
  }

  getDefaultListId(): number {
    return this.defaultListId;
  }

  getDefaultTemplateId(): number {
    return this.defaultTemplateId;
  }
}

let brevoServiceInstance: BrevoService | null = null;

export function getBrevoService(): BrevoService {
  if (!brevoServiceInstance) {
    try {
      brevoServiceInstance = new BrevoService();
    } catch (error: any) {
      console.error("Impossibile inizializzare BrevoService:", error.message);
      throw error;
    }
  }
  return brevoServiceInstance;
}

export { BrevoService };
