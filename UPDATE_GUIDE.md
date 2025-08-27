# 🔄 Guia de Atualização Automática

Parabéns! Seu site está funcionando em: **https://alejandrobr07.github.io/ranking-command-center/**

## 🚀 Como Atualizar o Site Automaticamente

### Método 1: Script Automático (Recomendado)
1. **Execute o arquivo `deploy.bat`** (duplo clique)
2. O script automaticamente:
   - Detecta mudanças nos arquivos
   - Cria commit com timestamp
   - Envia para GitHub
   - Atualiza o site em 2-5 minutos

### Método 2: Comandos Git Manual
```bash
cd "c:\Users\aleja\Downloads\Ranking Aldeia"
git add .
git commit -m "Atualização: descrição das mudanças"
git push origin main
```

### Método 3: Interface Web GitHub
1. Acesse seu repositório: https://github.com/alejandrobr07/ranking-command-center
2. Clique em "Upload files" ou edite arquivos diretamente
3. Faça commit das mudanças
4. Site atualiza automaticamente

## ⚡ Configuração Inicial (Uma Vez Só)

Se ainda não configurou o Git localmente:

```bash
cd "c:\Users\aleja\Downloads\Ranking Aldeia"
git init
git remote add origin https://github.com/alejandrobr07/ranking-command-center.git
git branch -M main
git config user.name "Seu Nome"
git config user.email "seu-email@exemplo.com"
```

## 🎯 Fluxo de Trabalho Recomendado

1. **Faça mudanças** nos arquivos localmente
2. **Teste localmente** rodando `node simple-server.js`
3. **Execute `deploy.bat`** para atualizar o site
4. **Aguarde 2-5 minutos** para ver as mudanças online

## 📝 Tipos de Mudanças Comuns

- **Configurações**: Edite `assets/js/config.js`
- **Estilos**: Modifique `assets/css/styles.css`
- **Funcionalidades**: Altere arquivos em `assets/js/`
- **Layout**: Ajuste `index.html`

## ⚠️ Dicas Importantes

- **Sempre teste localmente** antes de fazer deploy
- **Use mensagens descritivas** nos commits
- **GitHub Pages demora 2-5 minutos** para atualizar
- **Verifique o console** do navegador se algo não funcionar

## 🔧 Solução de Problemas

**Site não atualiza?**
- Aguarde até 10 minutos
- Limpe cache do navegador (Ctrl+F5)
- Verifique se o commit foi enviado no GitHub

**Erro no deploy.bat?**
- Execute como Administrador
- Verifique se o Git está instalado
- Confirme que está na pasta correta do projeto
