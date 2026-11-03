#!/usr/bin/env bash
# ════════════════════════════════════════════════════════════
# Arrêt du serveur — Salle du Numérique UNILU
# ════════════════════════════════════════════════════════════
echo "Arrêt du serveur SNU..."
fuser -k 8080/tcp 2>/dev/null || pkill -f "python.*server.py" 2>/dev/null
echo "Serveur arrêté avec succès."
