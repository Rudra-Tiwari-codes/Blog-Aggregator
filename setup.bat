@echo off
REM Blog Aggregator Setup Script for Windows
REM This script helps you quickly set up the Blog Aggregator project

echo ================================
echo Blog Aggregator Setup
echo ================================
echo.

REM Check if Node.js is installed
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed.
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo Node.js is installed: %NODE_VERSION%
echo.

REM Check if MongoDB is installed
where mongod >nul 2>&1
if %errorlevel% neq 0 (
    echo Warning: MongoDB is not found in PATH.
    echo Make sure MongoDB is installed and running.
    echo Download from: https://www.mongodb.com/try/download/community
    echo.
)

REM Setup Backend
echo Setting up backend...
cd server

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
    echo Please edit server\.env with your configuration:
    echo   - MONGODB_URI (MongoDB connection string^)
    echo   - OPENAI_API_KEY (Your OpenAI API key^)
    echo.
)

echo Installing backend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install backend dependencies
    pause
    exit /b 1
)

echo Backend setup complete
echo.

REM Setup Frontend
echo Setting up frontend...
cd ..\client

if not exist ".env" (
    echo Creating .env file from .env.example...
    copy .env.example .env >nul
)

echo Installing frontend dependencies...
call npm install

if %errorlevel% neq 0 (
    echo Error: Failed to install frontend dependencies
    pause
    exit /b 1
)

echo Frontend setup complete
echo.

cd ..

echo ================================
echo Setup Complete!
echo ================================
echo.
echo Next steps:
echo.
echo 1. Make sure MongoDB is running
echo    Command: net start MongoDB
echo.
echo 2. Edit server\.env with your configuration:
echo    - Add your OpenAI API key
echo    - Configure MongoDB URI if needed
echo.
echo 3. Start the backend server:
echo    cd server
echo    npm run dev
echo.
echo 4. In a new terminal, start the frontend:
echo    cd client
echo    npm run dev
echo.
echo 5. Fetch initial blog data:
echo    curl -X POST http://localhost:5000/api/admin/fetch-blogs
echo.
echo 6. Generate AI summaries:
echo    curl -X POST http://localhost:5000/api/admin/generate-summaries
echo.
echo 7. Open your browser to http://localhost:3000
echo.
echo For more details, see SETUP.md
echo ================================
echo.
pause
