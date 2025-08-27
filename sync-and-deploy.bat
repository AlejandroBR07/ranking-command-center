@echo off
echo ========================================
echo  SINCRONIZANDO E FAZENDO DEPLOY
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo [1/4] Sincronizando com GitHub (git pull)...
git pull origin main

echo [2/4] Adicionando mudanças locais...
git add .

echo [3/4] Fazendo commit das mudanças...
git commit -m "DEPLOY: Mudanças sincronizadas e enviadas"

echo [4/4] Enviando para GitHub...
git push origin main

echo.
echo ✅ Sincronização e deploy concluídos!
echo 🌐 GitHub: https://github.com/alejandrobr07/ranking-command-center
echo 🚀 Site: https://alejandrobr07.github.io/ranking-command-center/
echo.
echo PROCURE POR:
echo - "🚀 TESTE DE DEPLOY - Competição de Times" na primeira tela
echo - Título da aba: "Command Center v11.1: Deploy Test"
echo.
echo ⏱️ Aguarde 2-5 minutos e force refresh (Ctrl+F5)
echo.
pause
