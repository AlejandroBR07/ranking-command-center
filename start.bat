@echo off
echo Iniciando Centro de Comandos de Rankings...
echo.

REM Verificar se o MongoDB está rodando
echo Verificando MongoDB...
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo MongoDB está rodando.
) else (
    echo AVISO: MongoDB não está rodando. Inicie o MongoDB primeiro.
    echo Você pode iniciar com: mongod
    pause
)

echo.
echo Iniciando servidor Node.js...
npm start
