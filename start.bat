@echo off
echo ========================================
echo   Fair Acres Hotel Management System
echo ========================================
echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd Backend && npm start"
timeout /t 3 /nobreak >nul

echo Starting Frontend...
start "Frontend Dev Server" cmd /k "cd Frontend && npm run dev"

echo.
echo ========================================
echo Both servers are starting...
echo Backend: http://localhost:8000
echo Frontend: http://localhost:5173
echo ========================================
echo.
echo Press any key to open the app in browser...
pause >nul

start http://localhost:5173

echo.
echo To stop the servers, close both terminal windows.
