# 🗄️ Configuration Google Sheets pour MathPro

## 📋 Vue d'ensemble

Cette configuration permet de sauvegarder toutes vos données (élèves, rendez-vous, factures, etc.) dans Google Sheets au lieu du localStorage du navigateur. Cela garantit :

- ✅ **Sauvegarde permanente** de vos données
- ✅ **Accès multi-appareils** (les données sont synchronisées)
- ✅ **Sécurité** : les mots de passe et données sensibles ne sont pas dans le code HTML
- ✅ **Envoi d'emails réel** via Gmail
- ✅ **Historique complet** de toutes les actions

---

## 🚀 Installation étape par étape

### Étape 1 : Créer la feuille Google Sheets

1. Allez sur [sheets.google.com](https://sheets.google.com)
2. Cliquez sur **"Créer"** → **"Feuille de calcul vide"**
3. Renommez-la : **"MathPro - Base de données"**

### Étape 2 : Ouvrir l'éditeur Apps Script

1. Dans votre feuille, cliquez sur **Extensions** → **Apps Script**
2. Une nouvelle page s'ouvre avec l'éditeur de code

### Étape 3 : Copier le script

1. Ouvrez le fichier `google-apps-script.js` à la racine du projet
2. **Copiez tout le contenu**
3. Dans l'éditeur Apps Script, **supprimez tout le code existant**
4. **Collez le code copié**

### Étape 4 : Configurer la clé API

1. Dans le script, trouvez la ligne :
   ```javascript
   const API_KEY = 'VOTRE_CLE_SECRETE_A_MODIFIER';
   ```

2. **Générez une clé secrète** (exemple) :
   - Allez sur [random.org/passwords](https://www.random.org/passwords/)
   - Générez un mot de passe de 32 caractères
   - Ou utilisez : `MathPro2026!SecretKey#ABC123XYZ`

3. **Remplacez** `VOTRE_CLE_SECRETE_A_MODIFIER` par votre clé

4. **Copiez cette même clé** dans le fichier `src/services/googleSheetsAPI.ts` :
   ```typescript
   const API_KEY = 'MathPro2026!SecretKey#ABC123XYZ'; // Même clé que dans le script
   ```

### Étape 5 : Initialiser les feuilles

1. Dans l'éditeur Apps Script, en haut, sélectionnez la fonction **`testSetup`**
2. Cliquez sur **Exécuter** (bouton ▶️)
3. Google va vous demander des autorisations :
   - Cliquez sur **"Vérifier les autorisations"**
   - Choisissez votre compte Google
   - Cliquez sur **"Avancé"** → **"Accéder à MathPro (non sécurisé)"**
   - Cliquez sur **"Autoriser"**
4. Vérifiez dans les logs que tout s'est bien passé

5. Retournez dans votre feuille Google Sheets
6. Vous devriez voir **6 onglets** créés :
   - Eleves
   - RendezVous
   - Factures
   - BonsCommande
   - InfosSociete
   - Emails

### Étape 6 : Déployer l'application web

1. Dans l'éditeur Apps Script, cliquez sur **Déployer** → **Nouveau déploiement**
2. Cliquez sur l'icône ⚙️ à côté de "Sélectionner le type"
3. Choisissez **"Application Web"**
4. Remplissez :
   - **Description** : `MathPro API`
   - **Exécuter en tant que** : `Moi (votre@email.com)`
   - **Qui a accès** : `Tout le monde`
5. Cliquez sur **Déployer**
6. **Copiez l'URL du déploiement** (elle ressemble à : `https://script.google.com/macros/s/AKfycbx.../exec`)

### Étape 7 : Configurer le frontend

1. Ouvrez le fichier `src/services/googleSheetsAPI.ts`
2. Trouvez la ligne :
   ```typescript
   const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/VOTRE_DEPLOYMENT_ID/exec';
   ```
3. **Remplacez** l'URL par celle que vous avez copiée à l'étape précédente

### Étape 8 : Tester la connexion

1. Lancez votre application : `npm run dev`
2. Ouvrez la console du navigateur (F12)
3. Dans l'espace professeur, allez dans **Paramètres**
4. Modifiez une information et sauvegardez
5. Vérifiez dans la console qu'il n'y a pas d'erreur
6. Vérifiez dans Google Sheets que les données ont été sauvegardées

---

## 🔒 Sécurité

### Ce qui est sécurisé :

- ✅ **Mots de passe** : Stockés dans Google Sheets, pas dans le code HTML
- ✅ **Clé API** : Protège l'accès à votre script (à garder secrète)
- ✅ **Données sensibles** : IBAN, SIRET, etc. sont dans Sheets
- ✅ **Emails** : Envoyés via Gmail (authentifié)

### Ce qu'il faut protéger :

- ❌ **Ne JAMAIS partager** votre clé API
- ❌ **Ne JAMAIS committer** le fichier `google-apps-script.js` avec votre clé en clair sur GitHub
- ❌ **Ne JAMAIS rendre public** votre feuille Google Sheets

### Recommandations :

1. **Ajoutez `.env.local`** dans votre `.gitignore` :
   ```
   GOOGLE_SCRIPT_URL=
   API_KEY=
   ```

2. **Utilisez des variables d'environnement** dans `src/services/googleSheetsAPI.ts` :
   ```typescript
   const GOOGLE_SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL;
   const API_KEY = import.meta.env.VITE_API_KEY;
   ```

3. **Créez un fichier `.env.local`** (non commité) :
   ```
   VITE_GOOGLE_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   VITE_API_KEY=VotreCleSecrete
   ```

---

## 📊 Structure des données dans Google Sheets

### Feuille "Eleves"
| id | firstName | lastName | email | phone | level | notes | password | createdAt | archived |
|----|-----------|----------|-------|-------|-------|-------|----------|-----------|----------|

### Feuille "RendezVous"
| id | studentId | date | time | duration | subject | status | notes | price | paid | createdAt | archived | purchaseOrderId | invoiceId |
|----|-----------|------|------|----------|---------|--------|-------|-------|------|-----------|----------|-----------------|-----------|

### Feuille "Factures"
| id | number | studentId | date | dueDate | total | status | createdAt | autoGenerated | items |
|----|--------|-----------|------|---------|-------|--------|-----------|---------------|-------|

### Feuille "BonsCommande"
| id | number | studentId | date | total | status | createdAt | autoGenerated | items | appointmentId |
|----|--------|-----------|------|-------|--------|-----------|---------------|-------|---------------|

### Feuille "InfosSociete"
| companyName | legalForm | siret | sirene | rcs | tvaNumber | apeCode | address | postalCode | city | email | phone | website | iban | bic | bankName | legalMention | capital |
|-------------|-----------|-------|--------|-----|-----------|---------|---------|------------|------|-------|-------|---------|------|-----|----------|--------------|---------|

### Feuille "Emails"
| id | to | subject | body | type | createdAt |
|----|----|---------|------|------|-----------|

---

## 📧 Envoi d'emails réel

Le script utilise **Gmail** pour envoyer les emails. Quand vous activez l'option "Envoi automatique des emails" dans les paramètres :

1. **Mot de passe** : Envoyé à l'élève lors de l'inscription
2. **Bon de commande** : Envoyé lors de la confirmation d'un RDV
3. **Facture** : Envoyé lorsqu'un RDV passe en "Terminé"

### Limites Gmail :
- **100 emails/jour** pour les comptes personnels
- **1500 emails/jour** pour les comptes Google Workspace
- Si vous dépassez la limite, les emails seront mis en file d'attente

---

## 🔄 Synchronisation

### Sauvegarde automatique

Actuellement, la sauvegarde doit être déclenchée manuellement. Pour automatiser :

**Option 1 : Sauvegarde à chaque action**
Modifiez `src/context/AppContext.tsx` pour appeler l'API après chaque modification :

```typescript
import { saveAllData } from '../services/googleSheetsAPI';

// Dans chaque fonction de modification :
const addStudent = async (student) => {
  setState(prev => ({ ... }));
  await saveAllData(state); // Sauvegarde dans Google Sheets
};
```

**Option 2 : Sauvegarde périodique**
Ajoutez un intervalle dans `src/App.tsx` :

```typescript
useEffect(() => {
  const interval = setInterval(() => {
    saveAllData(state);
  }, 60000); // Toutes les 60 secondes
  
  return () => clearInterval(interval);
}, [state]);
```

**Option 3 : Bouton de sauvegarde manuel**
Ajoutez un bouton dans l'espace professeur :

```typescript
<button onClick={() => saveAllData(state)}>
  💾 Sauvegarder sur Google Sheets
</button>
```

---

## 🐛 Dépannage

### Erreur "Clé API invalide"
- Vérifiez que la clé est identique dans le script Google et dans `googleSheetsAPI.ts`
- Vérifiez qu'il n'y a pas d'espace en trop

### Erreur "Action non reconnue"
- Vérifiez que vous avez bien copié tout le code du script
- Vérifiez que la fonction `doPost` est bien présente

### Les données ne se sauvegardent pas
- Ouvrez la console du navigateur (F12)
- Vérifiez qu'il n'y a pas d'erreur CORS
- Vérifiez que l'URL du déploiement est correcte
- Vérifiez que le déploiement est bien en "Tout le monde"

### Erreur d'autorisation Gmail
- Retournez dans l'éditeur Apps Script
- Exécutez la fonction `testSetup`
- Autorisez l'accès à Gmail

### Les emails ne s'envoient pas
- Vérifiez que l'option "Envoi automatique des emails" est activée
- Vérifiez les logs dans la feuille "Emails"
- Vérifiez votre quota Gmail (100 emails/jour max)

---

## 📚 Ressources

- [Documentation Google Apps Script](https://developers.google.com/apps-script)
- [Documentation MailApp](https://developers.google.com/apps-script/reference/mail/mail-app)
- [Documentation SpreadsheetApp](https://developers.google.com/apps-script/reference/spreadsheet/spreadsheet-app)

---

## ✅ Checklist de configuration

- [ ] Feuille Google Sheets créée
- [ ] Script copié dans Apps Script
- [ ] Clé API générée et configurée (dans le script ET dans le frontend)
- [ ] Fonction `testSetup` exécutée avec succès
- [ ] 6 onglets créés dans la feuille
- [ ] Application web déployée
- [ ] URL du déploiement copiée dans `googleSheetsAPI.ts`
- [ ] Test de sauvegarde réussi
- [ ] Test d'envoi d'email réussi
- [ ] Clé API protégée (non commitée sur GitHub)

---

## 🎯 Prochaines étapes

Une fois la configuration terminée :

1. **Testez toutes les fonctionnalités** :
   - Créer un élève
   - Créer un rendez-vous
   - Confirmer le rendez-vous (bon de commande auto)
   - Terminer le rendez-vous (facture auto)
   - Vérifier que tout est dans Google Sheets

2. **Activez la sauvegarde automatique** (voir section "Synchronisation")

3. **Protégez votre clé API** avec des variables d'environnement

4. **Déployez votre site** sur Vercel/Netlify avec les variables d'environnement configurées

---

**🎉 Félicitations ! Vos données sont maintenant sauvegardées en sécurité sur Google Sheets !**
