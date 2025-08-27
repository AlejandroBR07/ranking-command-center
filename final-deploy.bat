@echo off
echo ========================================
echo  DEPLOY FINAL - Ranking Command Center
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo OPÇÃO 1: Tentando merge com históricos não relacionados...
git pull origin main --allow-unrelated-histories
if %errorlevel% equ 0 (
    echo ✅ Merge bem-sucedido!
    goto push_changes
)

echo.
echo OPÇÃO 2: Forçando push (sobrescreve GitHub)...
git push origin main --force
if %errorlevel% equ 0 (
    echo ✅ Push forçado bem-sucedido!
    goto success
)

echo.
echo OPÇÃO 3: Reset e push limpo...
git reset --hard HEAD~1
git add .
git commit -m "DEPLOY FINAL: Command Center v11.1 com mudanças de teste"
git push origin main --force
goto success

:push_changes
echo Enviando mudanças após merge...
git add .
git commit -m "DEPLOY: Merge e mudanças aplicadas"
git push origin main

:success
echo.
echo ✅ DEPLOY CONCLUÍDO!
echo 🌐 GitHub: https://github.com/alejandrobr07/ranking-command-center
echo 🚀 Site: https://alejandrobr07.github.io/ranking-command-center/
echo.
echo PROCURE POR:
echo - "🚀 TESTE DE DEPLOY - Competição de Times"
echo - Título da aba: "Command Center v11.1: Deploy Test"
echo.
echo ⏱️ Aguarde 2-5 minutos e acesse com Ctrl+F5
echo.
pause
