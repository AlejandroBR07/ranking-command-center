@echo off
echo ========================================
echo  FORÇANDO DEPLOY - Resolvendo Conflito
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo [1/3] Forçando merge com históricos não relacionados...
git pull origin main --allow-unrelated-histories

echo [2/3] Adicionando todas as mudanças...
git add .

echo [3/3] Enviando para GitHub (forçando)...
git push origin main --force

echo.
echo ✅ Deploy forçado com sucesso!
echo 🌐 GitHub: https://github.com/alejandrobr07/ranking-command-center
echo 🚀 Site: https://alejandrobr07.github.io/ranking-command-center/
echo.
echo MUDANÇAS APLICADAS:
echo - "🚀 TESTE DE DEPLOY - Competição de Times"
echo - Título: "Command Center v11.1: Deploy Test"
echo.
echo ⏱️ Aguarde 2-5 minutos e acesse o site com Ctrl+F5
echo.
pause
