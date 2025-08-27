// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  
  // Inicializar tooltips
  if (typeof tippy === 'function') {
    tippy('[title]', {
      content(reference) {
        return reference.getAttribute('title');
      },
      onShow(instance) {
        instance.reference.removeAttribute('title');
      },
      onHidden(instance) {
        instance.reference.setAttribute('title', instance.content);
      }
    });
  }
  
  // Configurar o botão "Comece Agora"
  const getStartedBtn = document.getElementById('get-started');
  if (getStartedBtn) {
    getStartedBtn.addEventListener('click', () => {
      if (token && user) {
        // Se o usuário estiver autenticado, mostrar o dashboard
        document.getElementById('welcome-section').classList.add('hidden');
        document.getElementById('dashboard').classList.remove('hidden');
        window.rankings.loadUserRankings();
      } else {
        // Se não estiver autenticado, mostrar o modal de login
        window.auth.showAuthModal('login');
      }
    });
  }
  
  // Configurar o tema (claro/escuro)
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'system';
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (savedTheme === 'system' && prefersDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }
  
  // Inicializar o tema
  initTheme();
  
  // Verificar se há uma mensagem de sucesso na URL (após redirecionamento)
  const urlParams = new URLSearchParams(window.location.search);
  const successMessage = urlParams.get('success');
  
  if (successMessage) {
    window.auth.showAlert(decodeURIComponent(successMessage), 'success');
    
    // Limpar a URL sem recarregar a página
    const cleanUrl = window.location.pathname;
    window.history.replaceState({}, document.title, cleanUrl);
  }
  
  // Configurar o botão de alternar tema (se existir)
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.documentElement.classList.contains('dark');
      
      if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      }
      
      // Atualizar preferência do usuário no servidor (se estiver logado)
      if (token && user) {
        const themePreference = isDark ? 'light' : 'dark';
        
        axios.put('/api/auth/me', {
          preferences: {
            theme: themePreference
          }
        }).catch(error => {
          console.error('Erro ao atualizar preferência de tema:', error);
        });
      }
    });
  }
  
  // Configurar o menu de usuário (se estiver logado)
  if (token && user) {
    const userMenu = document.getElementById('user-menu');
    const userAvatar = document.getElementById('user-avatar');
    const dropdownMenu = document.getElementById('dropdown-menu');
    
    if (userMenu && userAvatar && dropdownMenu) {
      userMenu.classList.remove('hidden');
      
      // Exibir iniciais do usuário no avatar
      const initials = user.username.charAt(0).toUpperCase();
      userAvatar.textContent = initials;
      
      // Alternar menu suspenso
      userAvatar.addEventListener('click', (e) => {
        e.stopPropagation();
        dropdownMenu.classList.toggle('hidden');
      });
      
      // Fechar menu ao clicar fora
      document.addEventListener('click', () => {
        if (!dropdownMenu.classList.contains('hidden')) {
          dropdownMenu.classList.add('hidden');
        }
      });
      
      // Prevenir fechamento ao clicar no menu
      dropdownMenu.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }
  }
  
  // Configurar o botão de logout
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      window.auth.logout();
    });
  }
  
  // Configurar links do menu de navegação
  const navLinks = document.querySelectorAll('nav a');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      // Adicionar classe de carregamento
      document.body.classList.add('loading');
      
      // Fechar menu móvel (se estiver aberto)
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
  
  // Configurar menu móvel (se existir)
  const mobileMenuButton = document.getElementById('mobile-menu-button');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuButton && mobileMenu) {
    mobileMenuButton.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
  
  // Configurar validação de formulários
  const forms = document.querySelectorAll('form');
  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      const requiredFields = form.querySelectorAll('[required]');
      let isValid = true;
      
      requiredFields.forEach(field => {
        if (!field.value.trim()) {
          isValid = false;
          field.classList.add('border-red-500');
          
          // Adicionar mensagem de erro
          let errorMessage = field.nextElementSibling;
          if (!errorMessage || !errorMessage.classList.contains('text-red-500')) {
            errorMessage = document.createElement('p');
            errorMessage.className = 'mt-1 text-sm text-red-500';
            field.parentNode.insertBefore(errorMessage, field.nextSibling);
          }
          
          errorMessage.textContent = 'Este campo é obrigatório';
          
          // Remover a mensagem de erro quando o usuário começar a digitar
          field.addEventListener('input', function onInput() {
            if (field.value.trim()) {
              field.classList.remove('border-red-500');
              
              if (errorMessage && errorMessage.parentNode) {
                errorMessage.parentNode.removeChild(errorMessage);
              }
              
              field.removeEventListener('input', onInput);
            }
          });
        }
      });
      
      if (!isValid) {
        e.preventDefault();
        
        // Rolar até o primeiro campo inválido
        const firstInvalid = form.querySelector('.border-red-500');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    });
  });
  
  // Configurar tooltips para elementos dinâmicos
  document.addEventListener('mouseover', (e) => {
    const target = e.target;
    
    if (target.hasAttribute('title') && !target._tippy) {
      tippy(target, {
        content: target.getAttribute('title'),
        onShow(instance) {
          instance.reference.removeAttribute('title');
        },
        onHidden(instance) {
          instance.reference.setAttribute('title', instance.content);
        }
      });
    }
  });
  
  // Configurar animações de entrada
  const animateOnScroll = () => {
    const elements = document.querySelectorAll('.animate-on-scroll');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const windowHeight = window.innerHeight;
      
      if (elementTop < windowHeight - 100) {
        element.classList.add('fade-in');
      }
    });
  };
  
  // Executar animações na carga inicial
  animateOnScroll();
  
  // Executar animações ao rolar a página
  window.addEventListener('scroll', animateOnScroll);
  
  // Configurar notificações em tempo real (se suportado)
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        console.log('Permissão para notificações concedida');
      }
    });
  }
  
  // Configurar service worker para PWA (desabilitado por enquanto)
  // if ('serviceWorker' in navigator) {
  //   window.addEventListener('load', () => {
  //     navigator.serviceWorker.register('/sw.js')
  //       .then(registration => {
  //         console.log('ServiceWorker registrado com sucesso:', registration.scope);
  //       })
  //       .catch(error => {
  //         console.error('Falha ao registrar ServiceWorker:', error);
  //       });
  //   });
  // }
});

// Função para exibir notificação
function showNotification(title, options = {}) {
  // Verificar se as notificações são suportadas
  if (!('Notification' in window)) {
    console.warn('Este navegador não suporta notificações');
    return;
  }
  
  // Verificar se as notificações estão permitidas
  if (Notification.permission === 'granted') {
    // Criar notificação
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    // Pedir permissão
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
}

// Função para copiar texto para a área de transferência
function copyToClipboard(text) {
  return new Promise((resolve, reject) => {
    if (navigator.clipboard) {
      // Usar a API moderna
      navigator.clipboard.writeText(text)
        .then(() => resolve(true))
        .catch(err => {
          console.error('Erro ao copiar para a área de transferência:', err);
          reject(err);
        });
    } else {
      // Fallback para navegadores mais antigos
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';  // Fora da tela
      textarea.style.left = '-9999px';
      textarea.style.top = '0';
      document.body.appendChild(textarea);
      
      try {
        textarea.select();
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        
        if (successful) {
          resolve(true);
        } else {
          reject(new Error('Falha ao copiar texto'));
        }
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    }
  });
}

// Função para formatar datas
function formatDate(dateString, options = {}) {
  const defaultOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  };
  
  const mergedOptions = { ...defaultOptions, ...options };
  const date = new Date(dateString);
  
  return date.toLocaleDateString('pt-BR', mergedOptions);
}

// Função para formatar números
function formatNumber(number, decimals = 2) {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals
  }).format(number);
}

// Exportar funções globais
window.utils = {
  showNotification,
  copyToClipboard,
  formatDate,
  formatNumber
};
