// Configuração do Axios para incluir o token JWT em todas as requisições
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['x-auth-token'] = token;
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Elementos da interface
const authButtons = document.getElementById('auth-buttons');
const userMenu = document.getElementById('user-menu');
const usernameSpan = document.getElementById('username');
const loginBtn = document.getElementById('login-btn');
const registerBtn = document.getElementById('register-btn');
const logoutBtn = document.getElementById('logout-btn');
const userAvatar = document.getElementById('user-avatar');
const dropdownMenu = document.getElementById('dropdown-menu');

// Verificar autenticação ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const token = localStorage.getItem('token');
  if (token) {
    fetchUserProfile();
  } else {
    showAuthButtons();
  }
});

// Função para fazer login
async function login(email, password) {
  try {
    const response = await axios.post('/api/auth/login', { email, password });
    const { token, user } = response.data;
    
    // Salvar token e informações do usuário
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Atualizar interface
    showUserMenu(user);
    
    // Mostrar mensagem de sucesso
    showAlert('Login realizado com sucesso!', 'success');
    
    // Redirecionar para o dashboard
    showDashboard();
    
    return true;
  } catch (error) {
    console.error('Erro no login:', error);
    showAlert('Credenciais inválidas. Tente novamente.', 'error');
    return false;
  }
}

// Função para fazer registro
async function register(username, email, password) {
  try {
    const response = await axios.post('/api/auth/register', { username, email, password });
    const { token, user } = response.data;
    
    // Salvar token e informações do usuário
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Atualizar interface
    showUserMenu(user);
    
    // Mostrar mensagem de sucesso
    showAlert('Registro realizado com sucesso!', 'success');
    
    // Redirecionar para o dashboard
    showDashboard();
    
    return true;
  } catch (error) {
    console.error('Erro no registro:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao realizar registro. Tente novamente.';
    showAlert(errorMessage, 'error');
    return false;
  }
}

// Função para fazer logout
function logout() {
  // Remover token e informações do usuário
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  
  // Redirecionar para a página inicial
  window.location.href = '/';
}

// Função para buscar o perfil do usuário
async function fetchUserProfile() {
  try {
    const response = await axios.get('/api/auth/me');
    const user = response.data;
    
    // Atualizar informações do usuário no localStorage
    localStorage.setItem('user', JSON.stringify(user));
    
    // Atualizar interface
    showUserMenu(user);
    
    // Mostrar dashboard se estiver na página inicial
    if (window.location.pathname === '/') {
      showDashboard();
    }
    
    return user;
  } catch (error) {
    console.error('Erro ao buscar perfil:', error);
    // Se não estiver autenticado, redirecionar para a página de login
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      showAuthButtons();
    }
    return null;
  }
}

// Função para mostrar botões de autenticação
function showAuthButtons() {
  authButtons.classList.remove('hidden');
  userMenu.classList.add('hidden');
  
  // Esconder dashboard e mostrar seção de boas-vindas
  document.getElementById('dashboard').classList.add('hidden');
  document.getElementById('welcome-section').classList.remove('hidden');
}

// Função para mostrar menu do usuário
function showUserMenu(user) {
  authButtons.classList.add('hidden');
  userMenu.classList.remove('hidden');
  
  // Atualizar nome de usuário e avatar
  usernameSpan.textContent = user.username;
  const initials = user.username.charAt(0).toUpperCase();
  userAvatar.textContent = initials;
  
  // Atualizar o título da página com o nome do usuário
  document.title = `${user.username} - Ranking Command Center`;
}

// Função para mostrar o dashboard
function showDashboard() {
  document.getElementById('welcome-section').classList.add('hidden');
  const dashboard = document.getElementById('dashboard');
  dashboard.classList.remove('hidden');
  
  // Carregar rankings do usuário
  loadUserRankings();
}

// Função para exibir alertas
function showAlert(message, type = 'info') {
  // Remover alertas existentes
  const existingAlert = document.querySelector('.alert');
  if (existingAlert) {
    existingAlert.remove();
  }
  
  // Criar elemento de alerta
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} fixed top-4 right-4 z-50 max-w-md`;
  alertDiv.textContent = message;
  
  // Adicionar botão de fechar
  const closeButton = document.createElement('button');
  closeButton.className = 'ml-4 text-xl';
  closeButton.innerHTML = '&times;';
  closeButton.onclick = () => alertDiv.remove();
  
  alertDiv.appendChild(closeButton);
  
  // Adicionar ao corpo do documento
  document.body.appendChild(alertDiv);
  
  // Remover após 5 segundos
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
}

// Event Listeners
if (loginBtn) {
  loginBtn.addEventListener('click', () => {
    // Implementar lógica de exibição do modal de login
    showAuthModal('login');
  });
}

if (registerBtn) {
  registerBtn.addEventListener('click', () => {
    // Implementar lógica de exibição do modal de registro
    showAuthModal('register');
  });
}

if (logoutBtn) {
  logoutBtn.addEventListener('click', logout);
}

// Toggle dropdown do menu do usuário
if (userAvatar) {
  userAvatar.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdownMenu.classList.toggle('hidden');
  });
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', () => {
  if (!dropdownMenu.classList.contains('hidden')) {
    dropdownMenu.classList.add('hidden');
  }
});

// Função para exibir modal de autenticação
function showAuthModal(type) {
  if (type === 'login') {
    Swal.fire({
      title: 'Entrar na Conta',
      html:
        '<form id="login-form">' +
        '<input id="swal-email" class="swal2-input" placeholder="Email" type="email" autocomplete="email">' +
        '<input id="swal-password" class="swal2-input" type="password" placeholder="Senha" autocomplete="current-password">' +
        '</form>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Entrar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const email = document.getElementById('swal-email').value;
        const password = document.getElementById('swal-password').value;
        
        if (!email || !password) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return false;
        }
        
        return { email, password };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const { email, password } = result.value;
        await login(email, password);
      }
    });
  } else {
    Swal.fire({
      title: 'Criar Conta',
      html:
        '<form id="register-form">' +
        '<input id="swal-username" class="swal2-input" placeholder="Nome de usuário" autocomplete="username">' +
        '<input id="swal-email" class="swal2-input" placeholder="Email" type="email" autocomplete="email">' +
        '<input id="swal-password" class="swal2-input" type="password" placeholder="Senha" autocomplete="new-password">' +
        '<input id="swal-confirm-password" class="swal2-input" type="password" placeholder="Confirmar Senha" autocomplete="new-password">' +
        '</form>',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Registrar',
      cancelButtonText: 'Cancelar',
      preConfirm: async () => {
        const username = document.getElementById('swal-username').value;
        const email = document.getElementById('swal-email').value;
        const password = document.getElementById('swal-password').value;
        const confirmPassword = document.getElementById('swal-confirm-password').value;
        
        if (!username || !email || !password || !confirmPassword) {
          Swal.showValidationMessage('Por favor, preencha todos os campos');
          return false;
        }
        
        if (password !== confirmPassword) {
          Swal.showValidationMessage('As senhas não coincidem');
          return false;
        }
        
        return { username, email, password };
      }
    }).then(async (result) => {
      if (result.isConfirmed && result.value) {
        const { username, email, password } = result.value;
        await register(username, email, password);
      }
    });
  }
}

// Exportar funções para uso em outros arquivos
window.auth = {
  login,
  register,
  logout,
  fetchUserProfile,
  showAlert
};
