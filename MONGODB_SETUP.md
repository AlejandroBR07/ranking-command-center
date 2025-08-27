# Guia de Instalação do MongoDB

## Para Windows

### Opção 1: MongoDB Community Server (Recomendado)

1. **Download**
   - Acesse: https://www.mongodb.com/try/download/community
   - Selecione: Windows x64
   - Baixe o arquivo `.msi`

2. **Instalação**
   - Execute o arquivo baixado como administrador
   - Escolha "Complete" installation
   - Marque "Install MongoDB as a Service"
   - Marque "Install MongoDB Compass" (interface gráfica)

3. **Configuração**
   - O MongoDB será instalado em: `C:\Program Files\MongoDB\Server\[version]\bin`
   - Adicione ao PATH do sistema se necessário

4. **Iniciar o serviço**
   ```cmd
   net start MongoDB
   ```

### Opção 2: MongoDB Atlas (Cloud - Gratuito)

1. **Criar conta**
   - Acesse: https://www.mongodb.com/atlas
   - Crie uma conta gratuita

2. **Criar cluster**
   - Escolha o plano gratuito (M0)
   - Selecione uma região próxima

3. **Configurar acesso**
   - Crie um usuário de banco de dados
   - Configure o IP de acesso (0.0.0.0/0 para desenvolvimento)

4. **Obter string de conexão**
   - Clique em "Connect" > "Connect your application"
   - Copie a string de conexão
   - Substitua no arquivo `.env`:
     ```
     MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ranking-command-center
     ```

## Verificar Instalação

```cmd
mongod --version
mongo --version
```

## Usar com o Projeto

1. **Para MongoDB local:**
   - Mantenha a configuração padrão no `.env`
   - Certifique-se de que o serviço está rodando

2. **Para MongoDB Atlas:**
   - Atualize a variável `MONGODB_URI` no `.env`
   - Substitua os controladores InMemory pelos originais no `server.js`

3. **Alternar para MongoDB:**
   ```javascript
   // Em server.js, substitua:
   const rankingRoutes = require('./src/routes/rankingRoutesInMemory');
   const authRoutes = require('./src/routes/authRoutesInMemory');
   
   // Por:
   const rankingRoutes = require('./src/routes/rankingRoutes');
   const authRoutes = require('./src/routes/authRoutes');
   
   // E descomente a conexão com MongoDB
   ```

## Comandos Úteis

```cmd
# Iniciar MongoDB
net start MongoDB

# Parar MongoDB
net stop MongoDB

# Acessar shell do MongoDB
mongo

# Ver bancos de dados
show dbs

# Usar banco específico
use ranking-command-center

# Ver coleções
show collections
```
