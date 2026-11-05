FROM python:3.10-slim

# Sécurité: créer un utilisateur non root
RUN useradd -m claudia_user

WORKDIR /app

# Mise en cache optimale des dépendances
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copie du code backend
COPY . /app/

# Permissions
RUN chown -R claudia_user:claudia_user /app

USER claudia_user

# Port d'écoute
ENV PORT=5050
EXPOSE 5050

# Lancement en production avec Gunicorn compatible Render ($PORT)
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5050} --workers 2 --timeout 120 app:app"]
