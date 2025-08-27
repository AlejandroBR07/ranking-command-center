# Centro de Comandos de Rankings

Um sistema completo para criação e gerenciamento de rankings personalizados, com autenticação de usuários, controle de permissões e interface amigável.

## 🚀 Recursos

- ✅ Criação e gerenciamento de rankings
- 👥 Controle de participantes e pontuações
- 🔒 Autenticação de usuários
- 👑 Níveis de permissão (usuário/admin)
- 🌓 Tema claro/escuro
- 📱 Design responsivo
- ⚡ PWA (Progressive Web App)

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+), Tailwind CSS
- **Backend**: Node.js, Express.js
- **Banco de Dados**: MongoDB com Mongoose
- **Autenticação**: JWT (JSON Web Tokens)
- **Outras Bibliotecas**: Axios, SweetAlert2, Tippy.js

## 📋 Pré-requisitos

- Node.js (v14 ou superior)
- MongoDB (local ou Atlas)
- NPM ou Yarn

## 🚀 Instalação

1. **Clone o repositório**
   ```bash
   git clone https://github.com/seu-usuario/centro-comandos-ranking.git
   cd centro-comandos-ranking
   ```

2. **Instale as dependências**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente**
   - Copie o arquivo `.env.example` para `.env`
   - Preencha as configurações necessárias

4. **Inicie o servidor de desenvolvimento**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

5. **Acesse a aplicação**
   Abra seu navegador em [http://localhost:3000](http://localhost:3000)

## 🏗️ Estrutura do Projeto

```
centro-comandos-ranking/
├── public/                 # Arquivos estáticos
│   ├── css/
│   ├── img/
│   └── js/
├── src/
│   ├── controllers/        # Lógica de negócios
│   ├── models/             # Modelos do MongoDB
│   ├── routes/             # Rotas da API
│   └── utils/              # Utilitários e helpers
├── .env                   # Variáveis de ambiente
├── server.js              # Ponto de entrada da aplicação
└── package.json           # Dependências e scripts
```

## 📝 Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e enviar pull requests.

## 📞 Suporte

Para suporte, envie um e-mail para suporte@exemplo.com ou abra uma issue no repositório.

---

Desenvolvido com ❤️ por [Seu Nome]
