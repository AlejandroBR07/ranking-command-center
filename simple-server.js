const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Servir arquivos estáticos
app.use(express.static(__dirname));

// Rota principal para servir o index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Centro de Comandos de Rankings rodando na porta ${PORT}`);
  console.log(`📺 Acesse: http://localhost:${PORT}`);
  console.log(`🔄 Sistema com alternância automática para TVs ativo`);
  console.log(`🌐 Integração N8N: Ativa`);
});
