@echo off
echo ==========================================
echo     Compilation Emscripten Space Cadet
echo ==========================================

echo.
echo 1. Configuration de l'environnement Emscripten...
cd /d "c:\Users\Joris GRANNAVEL\Downloads\Portfolio\emsdk"
call emsdk_env.bat

echo.
echo 2. Passage au dossier de build...
cd /d "c:\Users\Joris GRANNAVEL\Downloads\Portfolio\SpaceCadetPinball-master\build-web"

echo.
echo 3. Configuration avec emcmake cmake...
emcmake cmake ..

echo.
echo 4. Compilation avec emmake make...
emmake make

echo.
echo ==========================================
echo Compilation terminée !
echo Les fichiers sont dans le dossier bin/
echo ==========================================
pause

@REM @echo off
@REM echo ==========================================
@REM echo     Compilation Emscripten Space Cadet
@REM echo ==========================================

@REM echo.
@REM echo 1. Configuration de l'environnement Emscripten...
@REM cd /d "c:\Users\Joris GRANNAVEL\Downloads\Portfolio\emsdk"
@REM call emsdk_env.bat

@REM echo.
@REM echo DIAGNOSTIC - Verification des variables:
@REM echo PATH=%PATH%
@REM echo EMSDK_NODE=%EMSDK_NODE%
@REM echo.

@REM echo.
@REM echo 2. Passage au dossier de build...
@REM cd /d "c:\Users\Joris GRANNAVEL\Downloads\Portfolio\SpaceCadetPinball-master\build-web"

@REM echo.
@REM echo 3. Test de la disponibilité d'emcmake...
@REM where emcmake
@REM if errorlevel 1 (
@REM     echo ERREUR: emcmake non trouvé dans le PATH!
@REM     echo Vérifiez que Emscripten est correctement installé.
@REM     pause
@REM     exit /b 1
@REM )

@REM echo.
@REM echo 4. Configuration avec emcmake cmake...
@REM emcmake cmake ..
@REM if errorlevel 1 (
@REM     echo ERREUR lors de la configuration cmake
@REM     pause
@REM     exit /b 1
@REM )

@REM echo.
@REM echo 5. Compilation avec emmake make...
@REM emmake make
@REM if errorlevel 1 (
@REM     echo ERREUR lors de la compilation
@REM     pause
@REM     exit /b 1
@REM )

@REM echo.
@REM echo ==========================================
@REM echo Compilation terminée !
@REM echo Les fichiers sont dans le dossier bin/
@REM echo ==========================================
@REM pause
