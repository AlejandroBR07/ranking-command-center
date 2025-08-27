require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Importar rotas e middleware
const rankingRoutes = require('./src/routes/rankingRoutesInMemory');
const authRoutes = require('./src/routes/authRoutesInMemory');
const { errorHandler } = require('./src/utils/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rotas da API
app.use('/api/rankings', rankingRoutes);
app.use('/api/auth', authRoutes);

// Rota para o frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Middleware de tratamento de erros (deve ser o último)
app.use(errorHandler);

// Conectar ao MongoDB (desabilitado - usando banco em memória)
// mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ranking-command-center')
//   .then(() => console.log('Conectado ao MongoDB'))
//   .catch(err => console.error('Erro ao conectar ao MongoDB:', err));

console.log('Usando banco de dados em memória para demonstração');

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Acesse: http://localhost:${PORT}`);
});
