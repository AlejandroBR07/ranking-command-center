@echo off
echo ========================================
echo  Atualizando Ranking Command Center
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

REM Verificar se Git está inicializado
if not exist ".git" (
    echo ERRO: Git não está inicializado nesta pasta!
    echo Execute primeiro o arquivo setup-git.bat
    pause
    exit /b 1
)

REM Verificar se identidade do Git está configurada
git config user.name >nul 2>&1
if %errorlevel% neq 0 (
    echo ERRO: Identidade do Git não configurada!
    echo Execute primeiro o arquivo fix-git.bat
    pause
    exit /b 1
)

REM Adicionar todas as mudanças
echo [1/4] Adicionando arquivos modificados...
git add .

REM Verificar se há mudanças para commit
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo Nenhuma mudança detectada para atualizar.
    pause
    exit /b 0
)

REM Fazer commit com timestamp
echo [2/4] Criando commit...
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "timestamp=%DD%/%MM%/%YYYY% %HH%:%Min%"

git commit -m "Update: %timestamp%"

REM Push para GitHub
echo [3/4] Enviando para GitHub...
git push origin main

REM Aguardar deploy
echo [4/4] Deploy iniciado no GitHub Pages!
echo.
echo ✅ Atualização enviada com sucesso!
echo 🌐 Seu site será atualizado em: https://alejandrobr07.github.io/ranking-command-center/
echo ⏱️  Aguarde 2-5 minutos para as mudanças aparecerem online.
echo.
pause
