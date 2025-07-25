@echo off
REM === Rat Setup - "Jeu vidéo" Edition + Auto-clone + Auto-start ===

REM Couleurs (si possible)
for /f "delims=" %%A in ('"prompt $E & for %%B in (1) do rem"') do set "ESC=%%A"

REM ASCII ART
call :colorEcho 0A "====================================="
call :colorEcho 0A "      RAT - INSTALLATEUR ULTIME        "
call :colorEcho 0A "====================================="
call :colorEcho 07 ""

REM 0. Demander l'URL du repo si besoin
set REPO_URL=
set /p REPO_URL="Entre l'URL du repo git (https://...): "
if "%REPO_URL%"=="" (
    call :colorEcho 0C "Aucune URL fournie. Abandon."
    pause
    exit /b 1
)

REM 1. Vérifier git
where git >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "git n'est pas installe. Installe-le depuis https://git-scm.com/download/win puis relance ce setup."
    pause
    exit /b 1
)

REM 2. Cloner le projet dans %APPDATA%\Rat
set "RATDIR=%APPDATA%\Rat"
if exist "%RATDIR%" (
    call :colorEcho 0E "Le dossier %RATDIR% existe deja. Suppression..."
    rmdir /s /q "%RATDIR%"
)
call :colorEcho 0B "Clonage du projet dans %RATDIR%..."
git clone "%REPO_URL%" "%RATDIR%"
cd /d "%RATDIR%"

REM 3. Vérifier Python
where python >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "Python n'est pas installe."
    call :colorEcho 0E "Telechargement de Python..."
    start "" https://www.python.org/ftp/python/3.12.3/python-3.12.3-amd64.exe
    call :colorEcho 0E "Installe Python (coche 'Add to PATH'), puis relance ce setup."
    pause
    exit /b 1
)

REM 4. Vérifier pip
where pip >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "pip n'est pas installe."
    call :colorEcho 0E "Essaie d'installer pip automatiquement..."
    python -m ensurepip --upgrade
    where pip >nul 2>nul
    if errorlevel 1 (
        call :colorEcho 0C "pip toujours absent. Installe-le manuellement, puis relance ce setup."
        pause
        exit /b 1
    )
)

REM 5. Installer les dépendances Python
call :colorEcho 0B "Installation des dependances Python..."
pip install -r cipher\requirements.txt

REM 6. Vérifier pythonw.exe
where pythonw >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "pythonw.exe non trouve. Installe Python avec l'option 'Add to PATH'."
    pause
    exit /b 1
)

REM 7. Vérifier Node.js
where node >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "Node.js non trouve. Telechargement de Node.js..."
    start "" https://nodejs.org/dist/v20.11.1/node-v20.11.1-x64.msi
    call :colorEcho 0E "Installe Node.js, puis relance ce setup."
    pause
    exit /b 1
)

REM 8. Vérifier npm
where npm >nul 2>nul
if errorlevel 1 (
    call :colorEcho 0C "npm non trouve. Installe Node.js (npm inclus), puis relance ce setup."
    pause
    exit /b 1
)

REM 9. Installer les dépendances frontend
call :colorEcho 0B "Installation des dependances frontend (npm install)..."
cd web-dashboard
npm install
cd ..

REM 10. Lancer le backend en fond, sans fenêtre ni console
call :colorEcho 0A "Lancement du backend en fond (invisible)..."
start "" /B pythonw.exe cipher\App.py

REM 11. Ajouter le backend au demarrage de Windows
set "STARTUP=%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup"
echo start "" /B pythonw.exe "%RATDIR%\cipher\App.py" > "%STARTUP%\rat_backend.bat"
call :colorEcho 0A "Le backend sera lance automatiquement a chaque demarrage de Windows."

REM 12. Proposer de lancer le frontend
call :colorEcho 0E ""
set /p LAUNCH_FRONTEND="Veux-tu lancer le frontend (npm run dev) maintenant ? (o/n) : "
if /i "%LAUNCH_FRONTEND%"=="o" (
    cd web-dashboard
    start cmd /k "npm run dev"
    cd ..
    call :colorEcho 0A "Frontend lance dans une nouvelle fenetre."
) else (
    call :colorEcho 0E "Tu pourras lancer le frontend plus tard avec : cd web-dashboard && npm run dev"
)

call :colorEcho 0A "====================================="
call :colorEcho 0A "      INSTALLATION TERMINEE !           "
call :colorEcho 0A "====================================="
call :colorEcho 07 ""
pause
exit /b 0

REM --- Fonction pour afficher en couleur ---
:colorEcho
setlocal
set "color=%~1"
set "text=%~2"
<nul set /p="%ESC%[%color%m%text%%ESC%[0m"
echo.
endlocal
exit /b 