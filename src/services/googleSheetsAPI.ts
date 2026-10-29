/**
 * Service API pour Google Sheets via Google Apps Script
 *
 * Configuration :
 * 1. Créez une feuille Google Sheets
 * 2. Ouvrez Extensions > Apps Script
 * 3. Collez le code du fichier google-apps-script.js
 * 4. Déployez > Nouveau déploiement > Application Web
 * 5. Copiez l'URL du déploiement
 * 6. Collez-la dans les paramètres de l'application (section Google Sheets)
 */

// URL de votre Google Apps Script Web App (variable d'environnement sécurisée)
const getGoogleSheetsUrl = () => (import.meta as any).env?.VITE_GOOGLE_SCRIPT_URL || '';

// Clé d'API pour sécuriser les requêtes (variable d'environnement sécurisée)
const getApiKey = () => (import.meta as any).env?.VITE_API_KEY || '';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Sauvegarder toutes les données dans Google Sheets
 */
export async function saveAllData(data: any): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante. Veuillez configurer l\'URL et la clé API dans les paramètres.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveAll',
        apiKey: API_KEY,
        data: data,
      }),
    });

    return {
      success: true,
      message: 'Données sauvegardées avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde des données',
    };
  }
}

/**
 * Charger toutes les données depuis Google Sheets
 */
export async function loadAllData(): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante. Veuillez configurer l\'URL et la clé API dans les paramètres.',
    };
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=loadAll&apiKey=${API_KEY}`);
    const data = await response.json();

    return {
      success: true,
      message: 'Données chargées avec succès',
      data: data.data,
    };
  } catch (error) {
    console.error('Erreur lors du chargement:', error);
    return {
      success: false,
      message: 'Erreur lors du chargement des données',
    };
  }
}

/**
 * Sauvegarder un élève spécifique
 */
export async function saveStudent(student: any): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveStudent',
        apiKey: API_KEY,
        student: student,
      }),
    });

    return {
      success: true,
      message: 'Élève sauvegardé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de l\'élève:', error);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde de l\'élève',
    };
  }
}

/**
 * Sauvegarder un rendez-vous spécifique
 */
export async function saveAppointment(appointment: any): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveAppointment',
        apiKey: API_KEY,
        appointment: appointment,
      }),
    });

    return {
      success: true,
      message: 'Rendez-vous sauvegardé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du rendez-vous:', error);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde du rendez-vous',
    };
  }
}

/**
 * Sauvegarder une facture spécifique
 */
export async function saveInvoice(invoice: any): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'saveInvoice',
        apiKey: API_KEY,
        invoice: invoice,
      }),
    });

    return {
      success: true,
      message: 'Facture sauvegardée avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde de la facture:', error);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde de la facture',
    };
  }
}

/**
 * Sauvegarder un bon de commande spécifique
 */
export async function savePurchaseOrder(purchaseOrder: any): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'savePurchaseOrder',
        apiKey: API_KEY,
        purchaseOrder: purchaseOrder,
      }),
    });

    return {
      success: true,
      message: 'Bon de commande sauvegardé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du bon de commande:', error);
    return {
      success: false,
      message: 'Erreur lors de la sauvegarde du bon de commande',
    };
  }
}

/**
 * Vérifier si un email existe déjà
 */
export async function checkEmailExists(email: string): Promise<{ exists: boolean; student?: any }> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return { exists: false };
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=checkEmail&apiKey=${API_KEY}&email=${encodeURIComponent(email)}`);
    const data = await response.json();

    return {
      exists: data.exists || false,
      student: data.student,
    };
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'email:', error);
    return {
      exists: false,
    };
  }
}

/**
 * Tester la connexion avec Google Sheets
 */
export async function testConnection(): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante. Veuillez configurer l\'URL et la clé API.',
    };
  }

  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=loadAll&apiKey=${API_KEY}`);
    const data = await response.json();

    if (data.success) {
      return {
        success: true,
        message: 'Connexion réussie',
      };
    } else {
      return {
        success: false,
        message: data.message || 'Erreur de connexion',
      };
    }
  } catch (error) {
    console.error('Erreur lors du test de connexion:', error);
    return {
      success: false,
      message: 'Impossible de se connecter au script Google Apps Script',
    };
  }
}

/**
 * Envoyer un email via Google Apps Script
 */
export async function sendEmailViaGoogle(to: string, subject: string, body: string): Promise<SyncResult> {
  const GOOGLE_SCRIPT_URL = getGoogleSheetsUrl();
  const API_KEY = getApiKey();

  if (!GOOGLE_SCRIPT_URL || !API_KEY) {
    return {
      success: false,
      message: 'Configuration Google Sheets manquante.',
    };
  }

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify({
        action: 'sendEmail',
        apiKey: API_KEY,
        to: to,
        subject: subject,
        body: body,
      }),
    });

    return {
      success: true,
      message: 'Email envoyé avec succès',
    };
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return {
      success: false,
      message: 'Erreur lors de l\'envoi de l\'email',
    };
  }
}

/**
 * Envoyer un email de confirmation de réservation
 */
export async function sendBookingConfirmationEmail(
  studentEmail: string,
  studentName: string,
  date: string,
  time: string,
  duration: number,
  subject: string,
  price: number
): Promise<SyncResult> {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const emailBody = `Bonjour ${studentName},

Votre réservation a été enregistrée avec succès !

📅 Détails du cours :
• Date : ${formattedDate}
• Heure : ${time}
• Durée : ${duration} minutes
• Matière : ${subject}
• Tarif : ${price}€

Votre demande est en attente de confirmation par le professeur. Vous recevrez un email de confirmation dès que le créneau sera validé.

En cas de question ou pour modifier votre réservation, n'hésitez pas à nous contacter.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Confirmation de réservation - MS Académie`,
    emailBody
  );
}

/**
 * Envoyer un email de notification de modification de RDV
 */
export async function sendAppointmentUpdateEmail(
  studentEmail: string,
  studentName: string,
  date: string,
  time: string,
  duration: number,
  subject: string,
  status: string,
  changes: string
): Promise<SyncResult> {
  const formattedDate = new Date(date).toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const statusLabels: { [key: string]: string } = {
    pending: 'En attente',
    confirmed: 'Confirmé',
    completed: 'Terminé',
    cancelled: 'Annulé',
  };

  const emailBody = `Bonjour ${studentName},

Votre rendez-vous a été modifié.

📅 Détails du cours :
• Date : ${formattedDate}
• Heure : ${time}
• Durée : ${duration} minutes
• Matière : ${subject}
• Statut : ${statusLabels[status] || status}

🔄 Modifications apportées :
${changes}

Si vous avez des questions ou souhaitez apporter des modifications, n'hésitez pas à nous contacter.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Modification de votre rendez-vous - MS Académie`,
    emailBody
  );
}

/**
 * Envoyer un email de bienvenue avec mot de passe
 */
export async function sendWelcomeEmailViaGoogle(
  studentEmail: string,
  studentName: string,
  password: string
): Promise<SyncResult> {
  const emailBody = `Bonjour ${studentName},

Bienvenue sur MS Académie !

Votre compte a été créé avec succès. Voici vos identifiants de connexion :

🔐 Vos identifiants :
• Email : ${studentEmail}
• Mot de passe : ${password}

📚 Accès à votre espace élève :
• Consulter vos cours à venir
• Télécharger vos factures et bons de commande
• Uploader des documents
• Réserver de nouveaux cours

Pour vous connecter, rendez-vous sur la page d'accueil et cliquez sur "Espace élève".

⚠️ Important : Nous vous recommandons de changer votre mot de passe après votre première connexion.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Bienvenue sur MS Académie - Votre compte a été créé`,
    emailBody
  );
}

/**
 * Envoyer un email de récupération de mot de passe
 */
export async function sendPasswordRecoveryEmail(
  studentEmail: string,
  studentName: string,
  password: string
): Promise<SyncResult> {
  const emailBody = `Bonjour ${studentName},

Vous avez demandé la récupération de votre mot de passe MS Académie.

🔐 Votre mot de passe :
${password}

⚠️ Important :
• Conservez ce mot de passe en lieu sûr
• Nous vous recommandons de le changer après votre connexion
• Ne partagez jamais votre mot de passe

Si vous n'avez pas demandé cette récupération, ignorez cet email.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Récupération de votre mot de passe - MS Académie`,
    emailBody
  );
}

/**
 * Envoyer un email de bon de commande
 */
export async function sendPurchaseOrderEmail(
  studentEmail: string,
  studentName: string,
  poNumber: string,
  subject: string,
  date: string,
  time: string,
  price: number
): Promise<SyncResult> {
  const emailBody = `Bonjour ${studentName},

Votre cours a été confirmé. Voici votre bon de commande :

📋 Bon de commande N° ${poNumber}

📅 Détails du cours :
• Matière : ${subject}
• Date : ${date}
• Heure : ${time}
• Montant : ${price}€

Merci de conserver ce bon de commande pour vos dossiers.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Votre bon de commande ${poNumber} - MS Académie`,
    emailBody
  );
}

/**
 * Envoyer un email de facture
 */
export async function sendInvoiceEmail(
  studentEmail: string,
  studentName: string,
  invoiceNumber: string,
  subject: string,
  date: string,
  dueDate: string,
  price: number
): Promise<SyncResult> {
  const emailBody = `Bonjour ${studentName},

Votre cours est maintenant terminé. Voici votre facture :

📄 Facture N° ${invoiceNumber}

📅 Détails du cours :
• Matière : ${subject}
• Date du cours : ${date}
• Montant : ${price}€
• Date d'échéance : ${dueDate}

Merci de régler par virement sur le IBAN indiqué dans la facture.

Cordialement,
L'équipe MS Académie`;

  return sendEmailViaGoogle(
    studentEmail,
    `Votre facture ${invoiceNumber} - MS Académie`,
    emailBody
  );
}
