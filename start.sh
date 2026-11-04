#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
# Démarrage du serveur unifié — Salle du Numérique UNILU
# ════════════════════════════════════════════════════════════
PORT=${1:-8080}
echo "============================================================"
echo "  Démarrage de la Salle du Numérique UNILU sur le port $PORT"
echo "  - Site Public  : http://localhost:$PORT"
echo "  - Espace Admin : http://localhost:$PORT/admin (ou /admi)"
echo "============================================================"
python3 server.py "$PORT"

