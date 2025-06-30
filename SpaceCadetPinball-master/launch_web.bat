@echo off
echo ==========================================
echo   Post-compilation : Copie des fichiers
echo ==========================================

echo.
echo Vérification des fichiers générés...
if exist "bin\SpaceCadetPinball.html" (
    echo ✅ SpaceCadetPinball.html trouvé
) else (
    echo ❌ SpaceCadetPinball.html manquant
    goto :error
)

if exist "bin\SpaceCadetPinball.js" (
    echo ✅ SpaceCadetPinball.js trouvé
) else (
    echo ❌ SpaceCadetPinball.js manquant
    goto :error
)

if exist "bin\SpaceCadetPinball.wasm" (
    echo ✅ SpaceCadetPinball.wasm trouvé
) else (
    echo ❌ SpaceCadetPinball.wasm manquant
    goto :error
)

echo.
echo Tous les fichiers sont présents !
echo.
echo Lancement du serveur web local...
echo Ouvrez votre navigateur à : http://localhost:8000/bin/SpaceCadetPinball.html
echo.
echo Démarrage du serveur...
cd bin
python -m http.server 8000

goto :end

:error
echo.
echo ❌ Erreur: Fichiers manquants
echo La compilation n'est pas terminée ou a échoué
echo Relancez compile_emscripten.bat
pause

:end
