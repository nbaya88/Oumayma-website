# 🎓 MathPro — Gestion des Réservations

Application web complète de gestion de réservations pour professeur de mathématiques.

## ✨ Fonctionnalités

### 📋 Page d'accueil (Réservation publique)
- Processus de réservation en 3 étapes simplifiées
- Choix de la durée (1h/1h30/2h) avec tarifs
- Calendrier des 14 prochains jours avec créneaux horaires
- Détection automatique des créneaux déjà pris
- Formulaire d'inscription ou identification d'élève existant

### 📊 Tableau de bord
- Indicateurs clés (élèves, RDV du jour, en attente, revenus)
- Liste des prochains rendez-vous
- Résumé de la semaine par statut
- Tableau des dernières réservations

### 📅 Calendrier
- Vue mensuelle interactive avec navigation
- Indicateurs colorés par statut
- Actions : confirmer, annuler, supprimer, archiver, marquer terminé

### 👥 Gestion des élèves
- Grille de cartes avec avatar, niveau et solde
- Recherche en temps réel
- Ajout, modification, suppression, archivage
- Profil détaillé avec historique et balance financière

### 💰 Facturation
- Génération de factures à partir des RDV non payés
- Bons de commande personnalisables
- Impression de factures formatées
- Suivi des statuts (brouillon, envoyée, payée, en retard)

### 📦 Archives
- Éléments archivés (élèves et RDV)
- Possibilité de restauration

## 🚀 Installation

```bash
# Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/mathpro.git
cd mathpro

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build
```

## 🔐 Accès administrateur

1. Cliquez sur **"Espace professeur"** en bas de la page d'accueil
2. Ou ajoutez `#admin` à l'URL
3. Mot de passe de démonstration : `prof2026` ou `admin`

## 🛠️ Technologies

- React 18 + TypeScript
- Vite
- Tailwind CSS 4
- date-fns
- Lucide React
- UUID

## 📄 Licence

MIT
