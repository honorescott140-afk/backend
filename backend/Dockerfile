FROM python:3.10-slim

# Sécurité: ne pas utiliser le compte root
RUN useradd -m claudia_user

WORKDIR /app

# Copier les dépendances (requirements.txt n'est pas présent, on l'installe via pip)
COPY . /app

# Installation des dépendances
RUN pip install --no-cache-dir flask flask-cors python-dotenv google-genai google-generativeai requests PyJWT gunicorn

# Appliquer les permissions à l'utilisateur non root
RUN chown -R claudia_user:claudia_user /app

USER claudia_user

# Exposer le port de l'application
EXPOSE 5050

# Lancer le serveur backend
CMD ["python", "app.py"]
