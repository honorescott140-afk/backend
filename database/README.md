# Base de Données CMS — Salle du Numérique UNILU

Ce dossier contient les fichiers de la base de données utilisés par le système CMS d'administration et le site public.

## 📁 Fichiers

- **`content.json`** : 
  Base de données JSON principale du site. Elle stocke les textes, liens, slides, atouts, membres d'équipe, services, formations et témoignages du site.

- **`messages.json`** :
  Base de données des messages reçus via le formulaire de contact du site (`contact.html`).
  Chaque message contient :
  - `id` : Identifiant unique
  - `name` : Nom de l'expéditeur
  - `email` : Adresse e-mail
  - `phone` : Numéro de téléphone
  - `subject` : Objet du message
  - `message` : Contenu du message
  - `date` : Date et heure d'envoi lisibles
  - `timestamp` : Timestamp UNIX pour le tri
  - `read` : Statut (lu / non lu)

## 🔄 Synchronisation

1. **Messages** : Tout message envoyé depuis le site public est automatiquement stocké dans `database/messages.json` et synchronisé en temps réel avec l'onglet **Messagerie** de l'administration.
2. **CMS** : Toute modification effectuée depuis l'interface d'administration (`/admin`) est automatiquement enregistrée dans `database/content.json` et synchronisée avec le site public.
