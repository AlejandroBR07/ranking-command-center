# 🚀 Deploy do Ranking Command Center

## Passo a Passo para Deploy no GitHub Pages

### 1. Criar Repositório no GitHub
1. Acesse [github.com](https://github.com) e faça login
2. Clique em "New repository" (botão verde)
3. Nome sugerido: `ranking-command-center`
4. Marque como "Public" 
5. Clique em "Create repository"

### 2. Upload dos Arquivos
**Opção A - Interface Web (Mais Fácil):**
1. No repositório criado, clique em "uploading an existing file"
2. Arraste TODOS os arquivos da pasta `Ranking Aldeia` para o GitHub
3. Escreva uma mensagem: "Initial commit - Ranking Command Center v11.0"
4. Clique em "Commit changes"

**Opção B - Git Command Line:**
```bash
cd "c:\Users\aleja\Downloads\Ranking Aldeia"
git init
git add .
git commit -m "Initial commit - Ranking Command Center v11.0"
git branch -M main
git remote add origin https://github.com/SEU_USERNAME/ranking-command-center.git
git push -u origin main
```

### 3. Ativar GitHub Pages
1. No repositório, vá em "Settings" (aba superior)
2. Role para baixo até "Pages" (menu lateral esquerdo)
3. Em "Source", selecione "Deploy from a branch"
4. Branch: "main", Folder: "/ (root)"
5. Clique em "Save"

### 4. Acessar Aplicação
- URL será: `https://SEU_USERNAME.github.io/ranking-command-center`
- Deploy leva 2-5 minutos para ficar disponível
- GitHub enviará email quando estiver pronto

## ✅ Arquivos Já Preparados
- `index.html` - Página principal
- `assets/` - CSS, JS e recursos
- `netlify.toml` - Config para Netlify (alternativa)
- `vercel.json` - Config para Vercel (alternativa)
- `.gitignore` - Exclusões para produção

## 🎯 Características da Aplicação
- Sistema funciona com dados mock (não depende de webhook para demonstração)
- Layout horizontal dos cards KPI
- Taxa de conversão calculada automaticamente
- Interface otimizada para TV
- Rotação automática de views a cada 15 segundos

## 🔧 Configurações Pós-Deploy
Após o deploy, você pode:
1. Conectar webhook real editando `assets/js/config.js`
2. Personalizar cores e times no mesmo arquivo
3. Ajustar intervalos de rotação conforme necessário

## 📞 Suporte
Se precisar de ajuda, verifique:
- Console do navegador para erros
- GitHub Actions para logs de deploy
- Issues do repositório para problemas conhecidos
