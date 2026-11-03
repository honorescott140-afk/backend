@echo off
REM ════════════════════════════════════════════════════════════
REM Demarrage du serveur unifie — Salle du Numerique UNILU
REM ════════════════════════════════════════════════════════════
set PORT=%1
if "%PORT%"=="" set PORT=8080
echo ============================================================
echo   Demarrage de la Salle du Numerique UNILU sur le port %PORT%
echo   - Site Public  : http://localhost:%PORT%
echo   - Espace Admin : http://localhost:%PORT%/admin
echo ============================================================
python server.py %PORT%
if errorlevel 1 (
    python3 server.py %PORT%
)
pause
