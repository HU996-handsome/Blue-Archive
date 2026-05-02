@echo off
chcp 65001 >nul
title BA deploy server
echo ================================
echo   Blue Archive
echo   Building and starting server...
echo ================================
echo.
cd /d "D:\my web"
echo [1/2] Building...
call npm run build
echo.
echo [2/2] Starting server on port 8080...
echo.
echo After starting, create HTTP tunnel in Sakura Frp:
echo   Local IP:   127.0.0.1
echo   Local Port: 8080
echo.
echo ================================
npx serve dist -l 8080
pause
