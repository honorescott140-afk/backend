# Backend — Salle du Numérique UNILU (SNU)

Ce backend est **100% Python** (aucune dépendance Java requise).

Il prend en charge :
1. **L'API de l'assistant intelligent Claudia** (Gemini IA & conversation vocale / textuelle).
2. **Le système RAG** (connaissances spécifiques sur la Salle du Numérique et l'UNILU).
3. **La gestion sécurisée des jetons et accès administratifs**.

---

## 🔒 Configuration & Sécurité (`.env`)

Tous les paramètres de sécurité, jetons API et clés d'accès sont centralisés dans les variables d'environnement.

1. Copiez le template de sécurité :
```bash
cp .env.example .env
```

2. Éditez le fichier `.env` avec vos vraies clés :
* `GEMINI_API_KEY` : Clé API Google Gemini (sur [Google AI Studio](https://aistudio.google.com/)).
* `ADMIN_API_TOKEN` : Jeton secret protégeant les opérations d'administration.
* `ADMIN_DEFAULT_PASSWORD` : Mot de passe par défaut pour `/admin`.
* `JWT_SECRET` : Clé secrète de chiffrement des sessions.

> ⚠️ **Sécurité** : Le fichier `.env` contient des secrets et est strictement ignoré par Git via `.gitignore`. Ne commitez jamais ce fichier.

---

## 🚀 Lancement du Backend

### Option A — En local avec Python (Recommandé)

```bash
# 1. Créer un environnement virtuel (optionnel mais conseillé)
python3 -m venv venv
source venv/bin/activate   # Sous Windows: venv\Scripts\activate

# 2. Installer les dépendances Python
pip install -r requirements.txt

# 3. Lancer le service
python3 app.py
```

Le service démarre sur le port `5050` (ou le port spécifié dans votre `.env`).

---

### Option B — Avec Docker

```bash
docker-compose up -d --build
```

---

## 🛠️ Stack Technologique
* **Langage** : Python 3.10+
* **Framework Web** : Flask & Werkzeug
* **IA & LLM** : Google Generative AI (Gemini 1.5/2.0 Flash)
* **Sécurité** : JWT, Tokens Bearer, CORS contrôlés, Headers de sécurité HTTP

