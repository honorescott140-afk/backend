FROM python:3.10-slim

# Sécurité: créer un utilisateur non root
RUN useradd -m claudia_user

WORKDIR /app

# Mise en cache des dépendances
COPY backend/requirements.txt requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copie de l'ensemble du projet
COPY . /app/

# Permissions
RUN chown -R claudia_user:claudia_user /app

USER claudia_user

# Render injecte dynamiquement la variable PORT
ENV PORT=5050
EXPOSE 5050

# Lancement résilient compatible Render et local
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:${PORT:-5050} --workers 2 --timeout 120 --chdir backend app:app"]
