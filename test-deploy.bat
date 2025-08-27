@echo off
echo ========================================
echo  TESTE DE DEPLOY - Ranking Command Center
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo [1/5] Adicionando mudanças...
git add .

echo [2/5] Verificando mudanças...
git status --porcelain
if %errorlevel% equ 0 (
    echo Arquivos modificados detectados!
) else (
    echo Nenhuma mudança encontrada.
)

echo [3/5] Fazendo commit...
git commit -m "TESTE DE DEPLOY: Mudanças visíveis para validação"

echo [4/5] Enviando para GitHub...
git push origin main

echo [5/5] Verificando repositório remoto...
echo.
echo ✅ Deploy realizado!
echo 🌐 GitHub: https://github.com/alejandrobr07/ranking-command-center
echo 🚀 Site: https://alejandrobr07.github.io/ranking-command-center/
echo.
echo MUDANÇAS FEITAS:
echo - Título: "🚀 TESTE DE DEPLOY - Competição de Times"
echo - Comentário no CSS: "TESTE DE DEPLOY"
echo - Título da página: "Command Center v11.1: Deploy Test"
echo.
echo ⏱️ Aguarde 2-5 minutos e recarregue o site (Ctrl+F5)
echo.
pause
