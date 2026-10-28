/**
 * Google Apps Script pour MathPro
 * 
 * INSTRUCTIONS DE DÉPLOIEMENT :
 * 
 * 1. Créez une nouvelle feuille Google Sheets
 * 2. Renommez-la "MathPro - Base de données"
 * 3. Ouvrez Extensions > Apps Script
 * 4. Supprimez tout le code existant
 * 5. Collez ce code
 * 6. Modifiez la variable API_KEY ci-dessous avec une clé secrète
 * 7. Cliquez sur "Déployer" > "Nouveau déploiement"
 * 8. Type : "Application Web"
 * 9. Description : "MathPro API"
 * 10. Exécuter en tant que : "Moi"
 * 11. Qui a accès : "Tout le monde"
 * 12. Cliquez sur "Déployer"
 * 13. Copiez l'URL du déploiement
 * 14. Collez-la dans src/services/googleSheetsAPI.ts (variable GOOGLE_SCRIPT_URL)
 * 
 * SÉCURITÉ :
 * - La clé API doit être identique dans ce script et dans le frontend
 * - Utilisez une clé aléatoire longue (ex: générez-en une sur random.org)
 * - Ne partagez JAMAIS cette clé publiquement
 */

// ============================================
// CONFIGURATION
// ============================================

const API_KEY = 'VOTRE_CLE_SECRETE_A_MODIFIER'; // ⚠️ À MODIFIER avec votre clé secrète

// ============================================
// FONCTIONS PRINCIPALES
// ============================================

/**
 * Gestion des requêtes GET
 */
function doGet(e) {
  try {
    const action = e.parameter.action;
    const apiKey = e.parameter.apiKey;
    
    // Vérification de la clé API
    if (apiKey !== API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Clé API invalide'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    switch (action) {
      case 'loadAll':
        return handleLoadAll();
      case 'checkEmail':
        return handleCheckEmail(e.parameter.email);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Action non reconnue'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Gestion des requêtes POST
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    const apiKey = data.apiKey;
    
    // Vérification de la clé API
    if (apiKey !== API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({
        success: false,
        message: 'Clé API invalide'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    switch (action) {
      case 'saveAll':
        return handleSaveAll(data.data);
      case 'saveStudent':
        return handleSaveStudent(data.student);
      case 'saveAppointment':
        return handleSaveAppointment(data.appointment);
      case 'saveInvoice':
        return handleSaveInvoice(data.invoice);
      case 'savePurchaseOrder':
        return handleSavePurchaseOrder(data.purchaseOrder);
      case 'sendEmail':
        return handleSendEmail(data.to, data.subject, data.body);
      default:
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          message: 'Action non reconnue'
        })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// HANDLERS
// ============================================

/**
 * Charger toutes les données
 */
function handleLoadAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const data = {
    students: getSheetData('Eleves'),
    appointments: getSheetData('RendezVous'),
    invoices: getSheetData('Factures'),
    purchaseOrders: getSheetData('BonsCommande'),
    companyInfo: getSheetData('InfosSociete'),
    emailLogs: getSheetData('Emails'),
  };
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    data: data
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sauvegarder toutes les données
 */
function handleSaveAll(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (data.students) saveSheetData('Eleves', data.students);
  if (data.appointments) saveSheetData('RendezVous', data.appointments);
  if (data.invoices) saveSheetData('Factures', data.invoices);
  if (data.purchaseOrders) saveSheetData('BonsCommande', data.purchaseOrders);
  if (data.companyInfo) saveSheetData('InfosSociete', [data.companyInfo]);
  if (data.emailLogs) saveSheetData('Emails', data.emailLogs);
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Données sauvegardées avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sauvegarder un élève
 */
function handleSaveStudent(student) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Eleves');
  
  if (!sheet) {
    sheet = ss.insertSheet('Eleves');
    sheet.appendRow(['id', 'firstName', 'lastName', 'email', 'phone', 'level', 'notes', 'password', 'createdAt', 'archived']);
  }
  
  // Vérifier si l'élève existe déjà
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === student.id) {
      // Mettre à jour
      sheet.getRange(i + 1, 1, 1, 10).setValues([[
        student.id,
        student.firstName,
        student.lastName,
        student.email,
        student.phone,
        student.level,
        student.notes,
        student.password,
        student.createdAt,
        student.archived
      ]]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    // Ajouter
    sheet.appendRow([
      student.id,
      student.firstName,
      student.lastName,
      student.email,
      student.phone,
      student.level,
      student.notes,
      student.password,
      student.createdAt,
      student.archived
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Élève sauvegardé avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sauvegarder un rendez-vous
 */
function handleSaveAppointment(appointment) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('RendezVous');
  
  if (!sheet) {
    sheet = ss.insertSheet('RendezVous');
    sheet.appendRow(['id', 'studentId', 'date', 'time', 'duration', 'subject', 'status', 'notes', 'price', 'paid', 'createdAt', 'archived', 'purchaseOrderId', 'invoiceId']);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === appointment.id) {
      sheet.getRange(i + 1, 1, 1, 14).setValues([[
        appointment.id,
        appointment.studentId,
        appointment.date,
        appointment.time,
        appointment.duration,
        appointment.subject,
        appointment.status,
        appointment.notes,
        appointment.price,
        appointment.paid,
        appointment.createdAt,
        appointment.archived,
        appointment.purchaseOrderId || '',
        appointment.invoiceId || ''
      ]]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([
      appointment.id,
      appointment.studentId,
      appointment.date,
      appointment.time,
      appointment.duration,
      appointment.subject,
      appointment.status,
      appointment.notes,
      appointment.price,
      appointment.paid,
      appointment.createdAt,
      appointment.archived,
      appointment.purchaseOrderId || '',
      appointment.invoiceId || ''
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Rendez-vous sauvegardé avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sauvegarder une facture
 */
function handleSaveInvoice(invoice) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Factures');
  
  if (!sheet) {
    sheet = ss.insertSheet('Factures');
    sheet.appendRow(['id', 'number', 'studentId', 'date', 'dueDate', 'total', 'status', 'createdAt', 'autoGenerated', 'items']);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === invoice.id) {
      sheet.getRange(i + 1, 1, 1, 10).setValues([[
        invoice.id,
        invoice.number,
        invoice.studentId,
        invoice.date,
        invoice.dueDate,
        invoice.total,
        invoice.status,
        invoice.createdAt,
        invoice.autoGenerated || false,
        JSON.stringify(invoice.items)
      ]]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([
      invoice.id,
      invoice.number,
      invoice.studentId,
      invoice.date,
      invoice.dueDate,
      invoice.total,
      invoice.status,
      invoice.createdAt,
      invoice.autoGenerated || false,
      JSON.stringify(invoice.items)
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Facture sauvegardée avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Sauvegarder un bon de commande
 */
function handleSavePurchaseOrder(purchaseOrder) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('BonsCommande');
  
  if (!sheet) {
    sheet = ss.insertSheet('BonsCommande');
    sheet.appendRow(['id', 'number', 'studentId', 'date', 'total', 'status', 'createdAt', 'autoGenerated', 'items', 'appointmentId']);
  }
  
  const data = sheet.getDataRange().getValues();
  let found = false;
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === purchaseOrder.id) {
      sheet.getRange(i + 1, 1, 1, 10).setValues([[
        purchaseOrder.id,
        purchaseOrder.number,
        purchaseOrder.studentId,
        purchaseOrder.date,
        purchaseOrder.total,
        purchaseOrder.status,
        purchaseOrder.createdAt,
        purchaseOrder.autoGenerated || false,
        JSON.stringify(purchaseOrder.items),
        purchaseOrder.appointmentId || ''
      ]]);
      found = true;
      break;
    }
  }
  
  if (!found) {
    sheet.appendRow([
      purchaseOrder.id,
      purchaseOrder.number,
      purchaseOrder.studentId,
      purchaseOrder.date,
      purchaseOrder.total,
      purchaseOrder.status,
      purchaseOrder.createdAt,
      purchaseOrder.autoGenerated || false,
      JSON.stringify(purchaseOrder.items),
      purchaseOrder.appointmentId || ''
    ]);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    success: true,
    message: 'Bon de commande sauvegardé avec succès'
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Vérifier si un email existe
 */
function handleCheckEmail(email) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName('Eleves');
  
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({
      exists: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const data = sheet.getDataRange().getValues();
  
  for (let i = 1; i < data.length; i++) {
    if (data[i][3] === email) { // email est la colonne 4 (index 3)
      return ContentService.createTextOutput(JSON.stringify({
        exists: true,
        student: {
          id: data[i][0],
          firstName: data[i][1],
          lastName: data[i][2],
          email: data[i][3],
          phone: data[i][4],
          level: data[i][5],
          password: data[i][7]
        }
      })).setMimeType(ContentService.MimeType.JSON);
    }
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    exists: false
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Envoyer un email
 */
function handleSendEmail(to, subject, body) {
  try {
    MailApp.sendEmail({
      to: to,
      subject: subject,
      htmlBody: body.replace(/\n/g, '<br>')
    });
    
    // Logger l'email envoyé
    logEmail(to, subject, body);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      message: 'Email envoyé avec succès'
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================

/**
 * Obtenir les données d'une feuille
 */
function getSheetData(sheetName) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    return [];
  }
  
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) {
    return [];
  }
  
  const headers = data[0];
  const rows = [];
  
  for (let i = 1; i < data.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      row[headers[j]] = data[i][j];
    }
    rows.push(row);
  }
  
  return rows;
}

/**
 * Sauvegarder les données dans une feuille
 */
function saveSheetData(sheetName, data) {
  if (!data || data.length === 0) return;
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);
  
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }
  
  // Effacer les données existantes
  sheet.clear();
  
  // Obtenir les headers du premier objet
  const headers = Object.keys(data[0]);
  sheet.appendRow(headers);
  
  // Ajouter les données
  for (let i = 0; i < data.length; i++) {
    const row = headers.map(header => {
      const value = data[i][header];
      return typeof value === 'object' ? JSON.stringify(value) : value;
    });
    sheet.appendRow(row);
  }
}

/**
 * Logger un email envoyé
 */
function logEmail(to, subject, body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Emails');
  
  if (!sheet) {
    sheet = ss.insertSheet('Emails');
    sheet.appendRow(['id', 'to', 'subject', 'body', 'type', 'createdAt']);
  }
  
  const id = 'email_' + new Date().getTime();
  const createdAt = new Date().toISOString();
  
  sheet.appendRow([id, to, subject, body, 'auto', createdAt]);
}

/**
 * Fonction de test (à exécuter manuellement depuis l'éditeur Apps Script)
 */
function testSetup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  // Créer toutes les feuilles nécessaires
  const sheets = ['Eleves', 'RendezVous', 'Factures', 'BonsCommande', 'InfosSociete', 'Emails'];
  
  sheets.forEach(sheetName => {
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      
      // Ajouter les headers selon le type de feuille
      switch (sheetName) {
        case 'Eleves':
          sheet.appendRow(['id', 'firstName', 'lastName', 'email', 'phone', 'level', 'notes', 'password', 'createdAt', 'archived']);
          break;
        case 'RendezVous':
          sheet.appendRow(['id', 'studentId', 'date', 'time', 'duration', 'subject', 'status', 'notes', 'price', 'paid', 'createdAt', 'archived', 'purchaseOrderId', 'invoiceId']);
          break;
        case 'Factures':
          sheet.appendRow(['id', 'number', 'studentId', 'date', 'dueDate', 'total', 'status', 'createdAt', 'autoGenerated', 'items']);
          break;
        case 'BonsCommande':
          sheet.appendRow(['id', 'number', 'studentId', 'date', 'total', 'status', 'createdAt', 'autoGenerated', 'items', 'appointmentId']);
          break;
        case 'InfosSociete':
          sheet.appendRow(['companyName', 'legalForm', 'siret', 'sirene', 'rcs', 'tvaNumber', 'apeCode', 'address', 'postalCode', 'city', 'email', 'phone', 'website', 'iban', 'bic', 'bankName', 'legalMention', 'capital']);
          break;
        case 'Emails':
          sheet.appendRow(['id', 'to', 'subject', 'body', 'type', 'createdAt']);
          break;
      }
    }
  });
  
  Logger.log('Configuration terminée ! Toutes les feuilles ont été créées.');
}
