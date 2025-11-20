import type { Lead, Subscription } from "@shared/schema";
import { MAGGIOLINI_LOGO_BASE64 } from "./assets/logoBase64";

/**
 * Template email per notifica all'agenzia (ADMIN) quando arriva un nuovo lead
 */
export function getAdminLeadNotificationTemplate(lead: Lead): string {
  const formattedDate = new Date(lead.createdAt).toLocaleString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome'
  });

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Nuovo Lead Ricevuto</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #1a1a1a; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    🏠 Nuovo Lead Ricevuto
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    È stato ricevuto un nuovo contatto dal sito web:
                  </p>
                  
                  <!-- Lead Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; width: 140px;">
                        Nome
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        ${lead.nome}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        Email
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        <a href="mailto:${lead.email}" style="color: #1a73e8; text-decoration: none;">
                          ${lead.email}
                        </a>
                      </td>
                    </tr>
                    ${lead.fonte ? `
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        Fonte
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        ${lead.fonte}
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        Newsletter
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        ${lead.newsletter ? '✓ Sì' : '✗ No'}
                      </td>
                    </tr>
                    ${lead.ip ? `
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        IP
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333; font-family: monospace; font-size: 14px;">
                        ${lead.ip}
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; font-weight: 600; color: #555;">
                        Data
                      </td>
                      <td style="padding: 15px; color: #333;">
                        ${formattedDate}
                      </td>
                    </tr>
                  </table>
                  
                  <!-- Message -->
                  <div style="margin: 30px 0;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #555; font-size: 14px;">
                      MESSAGGIO:
                    </p>
                    <div style="background-color: #f9f9f9; border-left: 4px solid #1a1a1a; padding: 20px; border-radius: 4px;">
                      <p style="margin: 0; color: #333; font-size: 15px; line-height: 1.6; white-space: pre-wrap;">
${lead.messaggio}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 20px 30px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5; text-align: center;">
                  <p style="margin: 0; color: #888; font-size: 13px;">
                    Questa email è stata generata automaticamente dal sistema di gestione lead di Maggiolini Real Estate
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Template email di cortesia per l'utente che ha compilato il form
 */
export function getUserLeadConfirmationTemplate(nome: string): string {
  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Messaggio Ricevuto</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #8B2332; padding: 30px; text-align: center;">
                  <img src="${MAGGIOLINI_LOGO_BASE64}" alt="Immobiliare Maggiolini" style="max-width: 300px; height: auto; display: block; margin: 0 auto;" />
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <h2 style="margin: 0 0 20px 0; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                    Ciao ${nome},
                  </h2>
                  
                  <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Grazie per averci contattato.
                  </p>
                  
                  <p style="margin: 0 0 15px 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    Abbiamo ricevuto il tuo messaggio e ti richiameremo entro domani per capire esattamente cosa ti serve.
                  </p>
                  
                  <div style="margin: 30px 0; padding: 25px; background-color: #f9f9f9; border-radius: 6px; border-left: 4px solid #8B2332;">
                    <p style="margin: 0 0 20px 0; color: #333; font-size: 15px; line-height: 1.6;">
                      <strong>Nel frattempo, se hai bisogno di parlarci subito:</strong>
                    </p>
                    
                    <p style="margin: 0 0 8px 0; color: #333; font-size: 15px; line-height: 1.8;">
                      📞 <strong>Chiamaci:</strong>
                    </p>
                    <p style="margin: 0 0 18px 0; padding-left: 25px; color: #333; font-size: 15px; line-height: 1.6;">
                      <a href="tel:+393293589090" style="color: #8B2332; text-decoration: none; font-weight: 600;">329 358 9090</a> / 
                      <a href="tel:+390331555588" style="color: #8B2332; text-decoration: none; font-weight: 600;">0331 555588</a>
                    </p>
                    
                    <p style="margin: 0 0 8px 0; color: #333; font-size: 15px; line-height: 1.8;">
                      📍 <strong>Vieni in agenzia:</strong>
                    </p>
                    <p style="margin: 0 0 18px 0; padding-left: 25px; color: #333; font-size: 15px; line-height: 1.6;">
                      Via Paolo Castelnovo, 14<br>
                      20015 Parabiago (MI)
                    </p>
                    
                    <p style="margin: 0 0 8px 0; color: #555; font-size: 14px; line-height: 1.6;">
                      🕒 <strong>Orari:</strong>
                    </p>
                    <p style="margin: 0; padding-left: 25px; color: #555; font-size: 14px; line-height: 1.6;">
                      Lunedì - Venerdì: 9:30-13:00 / 14:30-18:30
                    </p>
                  </div>
                  
                  <p style="margin: 20px 0 0 0; color: #333333; font-size: 16px; line-height: 1.6;">
                    A presto,<br>
                    <strong>Il team Maggiolini</strong>
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5;">
                  <table width="100%" cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="text-align: center; padding-bottom: 15px;">
                        <p style="margin: 0 0 5px 0; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                          Immobiliare Maggiolini
                        </p>
                        <p style="margin: 0; color: #888; font-size: 13px; font-style: italic;">
                          Da quarant'anni qui quando serve
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td style="text-align: center; padding-top: 15px; border-top: 1px solid #e5e5e5;">
                        <p style="margin: 0; color: #888; font-size: 12px; line-height: 1.5;">
                          Questa email è stata inviata in risposta alla tua richiesta di contatto.<br>
                          Se non hai effettuato questa richiesta, puoi ignorare questo messaggio.
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

/**
 * Template email per notifica all'admin quando un utente si disiscriv
 */
export function getAdminUnsubscribeNotificationTemplate(subscription: Subscription): string {
  const formattedDate = new Date().toLocaleString('it-IT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Rome'
  });

  const subscribedTo = [];
  if (subscription.blogUpdates) subscribedTo.push('Nuovi Articoli Blog');
  if (subscription.newListings) subscribedTo.push('Nuovi Immobili');
  const waiveringText = subscribedTo.length > 0 ? subscribedTo.join(' e ') : 'Nessuna lista attiva';

  return `
    <!DOCTYPE html>
    <html lang="it">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Disiscrizione dalla Newsletter</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background-color: #dc2626; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 600;">
                    📧 Disiscrizione dalla Newsletter
                  </h1>
                </td>
              </tr>
              
              <!-- Body -->
              <tr>
                <td style="padding: 40px 30px;">
                  <p style="margin: 0 0 20px 0; color: #333333; font-size: 16px; line-height: 1.5;">
                    Un utente si è disiscritto dalla newsletter:
                  </p>
                  
                  <!-- Subscription Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0; border: 1px solid #e5e5e5; border-radius: 6px; overflow: hidden;">
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555; width: 140px;">
                        Email
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        <a href="mailto:${subscription.email}" style="color: #1a73e8; text-decoration: none;">
                          ${subscription.email}
                        </a>
                      </td>
                    </tr>
                    ${subscription.nome ? `
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        Nome
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        ${subscription.nome}
                      </td>
                    </tr>
                    ` : ''}
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; border-bottom: 1px solid #e5e5e5; font-weight: 600; color: #555;">
                        Era iscritto a
                      </td>
                      <td style="padding: 15px; border-bottom: 1px solid #e5e5e5; color: #333;">
                        ${waiveringText}
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 15px; background-color: #f9f9f9; font-weight: 600; color: #555;">
                        Data disiscrizione
                      </td>
                      <td style="padding: 15px; color: #333;">
                        ${formattedDate}
                      </td>
                    </tr>
                  </table>
                  
                  <p style="margin: 20px 0 0 0; color: #666; font-size: 14px; line-height: 1.6;">
                    L'utente è stato rimosso dalle liste di distribuzione e non riceverà più email automatiche.
                  </p>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="padding: 30px; background-color: #f9f9f9; border-top: 1px solid #e5e5e5;">
                  <p style="margin: 0; color: #888; font-size: 12px; text-align: center;">
                    Questa è una notifica automatica dal sistema di gestione newsletter.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
