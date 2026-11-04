# Fonctionnement général

Ce dépôt contient l’interface publique responsive de la Salle du Numérique UNILU, ses pages d’information, son formulaire de contact et son assistant.

Le site public affiche les contenus et les ressources visuelles. Les fonctions d’administration, les autorisations, les téléversements, la consultation des messages et les modifications du contenu doivent être traités exclusivement par le backend.

Le thème clair ou sombre est mémorisé localement dans le navigateur. Les données sensibles, identifiants, mots de passe, jetons, clés et paramètres privés ne doivent jamais être enregistrés dans le frontend ou dans la documentation.

En production, l’authentification et les contrôles d’accès doivent être configurés dans le service backend ou la plateforme d’hébergement, avec des variables privées non publiées.

PostgreSql comme modele de base de données et Mysql comme base de données de production