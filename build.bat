@echo off
REM DRuf – baut die DRuf.exe (Windows, Node.js 18+ erforderlich)
echo [1/2] Installiere Abhaengigkeiten...
call npm install
if errorlevel 1 goto :fehler

echo [2/2] Erstelle DRuf.exe...
call npx electron-builder --win portable --x64
if errorlevel 1 goto :fehler

echo.
echo Fertig! Die Datei liegt in dist\DRuf 1.0.0.exe
echo Kopiere sie in einen Ordner zusammen mit einer config.json (siehe config.example.json).
pause
exit /b 0

:fehler
echo.
echo Build fehlgeschlagen.
pause
exit /b 1
