@echo off
REM ════════════════════════════════════════════════════════════
REM Arret du serveur — Salle du Numerique UNILU
REM ════════════════════════════════════════════════════════════
echo Arret du serveur SNU sur le port 8080...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8080') do (
    taskkill /f /pid %%a 2>nul
)
echo Serveur arrete.
pause
