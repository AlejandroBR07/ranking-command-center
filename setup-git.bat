@echo off
echo ========================================
echo  Configurando Git para o Projeto
echo ========================================
echo.

REM Verificar se estamos no diretório correto
if not exist "index.html" (
    echo ERRO: Execute este script na pasta do projeto!
    pause
    exit /b 1
)

echo [1/5] Inicializando repositório Git local...
git init

echo [2/5] Configurando repositório remoto...
git remote add origin https://github.com/alejandrobr07/ranking-command-center.git

echo [3/5] Configurando branch principal...
git branch -M main

echo [4/5] Adicionando todos os arquivos...
git add .

echo [5/5] Fazendo commit inicial...
git commit -m "Setup: Configuração inicial do repositório local"

echo.
echo ✅ Git configurado com sucesso!
echo 🔗 Conectado ao repositório: https://github.com/alejandrobr07/ranking-command-center
echo.
echo Agora você pode usar o deploy.bat para atualizar o site!
echo.
pause
