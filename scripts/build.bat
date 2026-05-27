@echo off
echo ========================================
echo   WANGTranslate - Build Script
echo ========================================
echo.

echo [1/3] Generating icon...
node scripts\generate-icon.js
if %ERRORLEVEL% NEQ 0 (
    echo WARNING: Icon generation failed, continuing...
)

echo.
echo [2/3] Building portable executable...
npx electron-builder --win portable
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Portable build failed
    exit /b 1
)

echo.
echo [3/3] Building NSIS installer...
npx electron-builder --win nsis
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Installer build failed
    exit /b 1
)

echo.
echo ========================================
echo   Build Complete!
echo.
echo   Output files in dist\:
echo     - WANGTranslate Setup x.x.x.exe  (NSIS installer)
echo     - WANGTranslate-portable.exe     (portable)
echo ========================================
