@echo off
echo ========================================
echo  Corrigindo Configuração do Git
echo ========================================
echo.

REM Configurar identidade do Git
echo [1/3] Configurando sua identidade no Git...
git config --global user.name "alejandrobr07"
git config --global user.email "alejandrobr07@users.noreply.github.com"

echo [2/3] Fazendo commit inicial com identidade configurada...
git add .
git commit -m "Initial commit: Ranking Command Center v11.0"

echo [3/3] Enviando para GitHub...
git push -u origin main

echo.
echo ✅ Git configurado e sincronizado com sucesso!
echo 🌐 Seu repositório: https://github.com/alejandrobr07/ranking-command-center
echo 🚀 Site disponível em: https://alejandrobr07.github.io/ranking-command-center/
echo.
echo Agora o deploy.bat funcionará perfeitamente!
echo.
pause
