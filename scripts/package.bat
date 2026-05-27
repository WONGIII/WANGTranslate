@echo off
echo ========================================
echo   WANGTranslate - Package Script
echo ========================================
echo.

REM Step 1: Generate tray icons
echo [1/4] Generating tray icons...
node scripts\generate-tray-icon.js
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Tray icon generation failed
)

REM Step 2: Clear winCodeSign cache and pre-extract it manually
echo [2/4] Preparing build tools...
set CC=C:\Users\%USERNAME%\AppData\Local\electron-builder\Cache\winCodeSign
if exist "%CC%" (
    for /d %%d in ("%CC%\*") do (
        if exist "%%d\rcedit-x64.exe" (
            echo Found rcedit in %%d
            copy /Y "%%d\rcedit-x64.exe" "%CC%\rcedit-x64.exe" >nul 2>&1
            if not exist "%CC%\winCodeSign-2.6.0" mkdir "%CC%\winCodeSign-2.6.0"
            copy /Y "%%d\rcedit-x64.exe" "%CC%\winCodeSign-2.6.0\rcedit-x64.exe" >nul 2>&1
        )
    )
)

REM Step 3: Build unpacked app
echo [3/4] Building unpacked app...
call npx electron-builder --dir --win
if %ERRORLEVEL% NEQ 0 (
    echo Trying alternative: direct packaging...
)

REM Step 4: Create portable zip from win-unpacked
echo [4/4] Creating portable package...
if exist dist\win-unpacked (
    powershell -Command "Compress-Archive -Path 'dist\win-unpacked\*' -DestinationPath 'dist\WANGTranslate-portable.zip' -Force"
    echo Created: dist\WANGTranslate-portable.zip
    echo.
    echo Users can extract this zip and run WANGTranslate.exe directly.
)

echo.
echo ========================================
echo   Package complete!
echo   dist\WANGTranslate-portable.zip
echo ========================================
