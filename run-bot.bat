@echo off
echo =========================================
echo 🤖 Lancement du Robot LinkedIn...
echo =========================================
echo.

echo Verification des dependances...
call npm install puppeteer --no-save
echo.

echo Lancement du script...
node scripts\linkedin-bot.mjs

echo.
pause
