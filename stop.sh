#!/usr/bin/env bash
# Arrêt propre du serveur SNU sur le port 8080 (ou argument)
PORT=${1:-8080}
PID=$(lsof -ti :"$PORT" 2>/dev/null)
if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "Serveur sur le port $PORT arrêté avec succès (PID $PID)."
else
    echo "Aucun serveur n'était actif sur le port $PORT."
fi

