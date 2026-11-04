@echo off
set PORT=8080
if not "%1"=="" set PORT=%1
echo ============================================================
echo   Demarrage de la Salle du Numerique UNILU sur le port %PORT%
echo   - Site Public  : http://localhost:%PORT%
echo   - Espace Admin : http://localhost:%PORT/admin (ou /admi)
echo ============================================================
python server.py %PORT%
pause

