@echo off
set PORT=8080
if not "%1"=="" set PORT=%1
echo Arret du serveur sur le port %PORT%...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%PORT%" ^| findstr "LISTENING"') do taskkill /F /PID %%a 2>nul
echo Termine.

