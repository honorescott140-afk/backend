# Salle du Numérique UNILU (SNU) — Plateforme Officielle & CMS

Architecture unifiée, nettoyée et modulaire du site web officiel de la Salle du Numérique de l'Université de Lubumbashi (UNILU) avec son espace d'administration CMS.

---

## 📁 Architecture du Projet

```text
salle-snu-01--main/
├── frontend/                     # Tout le frontend (Site Public + Espace Admin)
│   ├── index.html               # Page d'accueil du site utilisateur
│   ├── project.html             # Page projets & équipements
│   ├── contact.html             # Page contact & localisation UNILU
│   ├── css/                     # Feuilles de style du site public
│   ├── js/                      # Scripts et dynamisation du site
│   ├── lib/                     # Librairies du site (fonts, icons, carousels)
│   ├── img/                     # Photos, logos et téléversements (uploads/)
│   ├── data/                    # Données CMS du site (content.json)
│   └── admin/                   # Espace Administration CMS (accessible via /admin)
│       ├── index.html           # Tableau de bord complet d'administration
│       ├── admin.html           # Alias direct
│       ├── css/                 # Styles dédiés de l'admin
│       ├── js/                  # Scripts et gestion de session admin
│       ├── lib/                 # Librairies d'icônes et polices admin
│       └── img/                 # Logos et aperçus admin
│
├── backend/                      # Serveur Backend & Moteur IA Claudia
│   ├── app.py                   # Serveur Flask & RAG Claudia (Gemini)
│   ├── .env                     # Stockage centralisé des tokens et clés sécurisées
│   ├── .env.example             # Modèle de configuration des tokens
│   ├── requirements.txt         # Dépendances Python (flask, google-genai, etc.)
│   ├── Dockerfile               # Conteneurisation Docker
│   ├── docker-compose.yml       # Déploiement multi-conteneurs
│   └── voices.txt               # Répertoire des voix
│
├── database/                     # Base de données centrale du CMS
│   ├── content.json             # Source de données JSON de tous les contenus
│   └── README.md                # Guide de structure de la base de données
│
├── server.py                    # Serveur web unifié (sert le site et l'admin sur le port 8080)
├── start.sh / start.bat         # Démarrage en 1 commande (Linux / Windows)
├── stop.sh / stop.bat           # Arrêt du serveur (Linux / Windows)
└── README.md                    # Cette documentation
```

---

## 🚀 Démarrage Rapide

### Sur Linux / Mac :
```bash
bash start.sh
```

### Sur Windows :
Double-cliquez sur `start.bat`.

---

## 🌐 Liens d'Accès

* **Site Utilisateur (Public)** : [http://localhost:8080](http://localhost:8080)
* **Espace Administration** : [http://localhost:8080/admin](http://localhost:8080/admin) *(ou tapez simplement `/admin` dans l'URL)*
  * Mot de passe par défaut : `admin123`
* **Arrêt du serveur** : `bash stop.sh` (ou double-clic sur `stop.bat`)

---

## 🔐 Sécurité & Stockage des Tokens

* **Côté Backend** : Tous les tokens et clés secrètes (`GEMINI_API_KEY`, `ADMIN_API_TOKEN`, `JWT_SECRET`) sont stockés dans `backend/.env`.
* **Côté Admin** : Les jetons de session d'administration sont stockés de manière sécurisée dans `sessionStorage` et `localStorage` (`snu_admin_token`) et transmis via l'en-tête `Authorization: Bearer <token>`.
