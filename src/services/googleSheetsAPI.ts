/**
 * Service API pour Google Sheets via Google Apps Script
 * 
 * Configuration :
 * 1. Créez une feuille Google Sheets
 * 2. Ouvrez Extensions > Apps Script
 * 3. Collez le code du fichier google-apps-script.js
 * 4. Déployez > Nouveau déploiement > Application Web
 * 5. Copiez l'URL du déploiement
 * 6. Collez-la dans la variable GOOGLE_SCRIPT_URL ci-dessous
 */

// URL de votre Google Apps Script Web App
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwprK93l5OlA3vuJsnmPNGJt1LqESTWGEjHH2H6516OYx7KU0D7uIJnPF0UjfLFBOGM/exec';

// Clé d'API pour sécuriser les requêtes (à définir dans le script Google)
const API_KEY = 'WqG3WCVn4W4z3p3cnVu97eWhNWbxadqK';

export interface SyncResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Sauvegarder toutes les données dans Google Sheets
 */
export async function saveAllData(data: any): Promise<SyncResult> {
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
  try {
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=loadAll&apiKey=${API_KEY}`);
    const data = await response.json();

    return {
      success: true,
      message: 'Données chargées avec succès',
      data: data,
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
 * Envoyer un email via Google Apps Script
 */
export async function sendEmailViaGoogle(to: string, subject: string, body: string): Promise<SyncResult> {
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
