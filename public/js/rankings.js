// Variáveis globais
let currentRankingId = null;
let currentParticipantId = null;

// Elementos da interface
const rankingsList = document.getElementById('rankings-list');
const createRankingBtn = document.getElementById('create-ranking-btn');
const rankingForm = document.getElementById('ranking-form');
const rankingModal = document.getElementById('ranking-modal');
const closeModalBtn = document.getElementById('close-modal');
const cancelRankingBtn = document.getElementById('cancel-ranking');
const criteriaList = document.getElementById('criteria-list');
const addCriteriaBtn = document.getElementById('add-criteria');
const viewRankingModal = document.getElementById('view-ranking-modal');
const closeViewModalBtn = document.getElementById('close-view-modal');
const closeViewBtn = document.getElementById('close-view');
const participantModal = document.getElementById('participant-modal');
const closeParticipantModalBtn = document.getElementById('close-participant-modal');
const cancelParticipantBtn = document.getElementById('cancel-participant');
const participantForm = document.getElementById('participant-form');
const addParticipantBtn = document.getElementById('add-participant-btn');

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
  // Verificar se o usuário está autenticado
  const token = localStorage.getItem('token');
  if (token) {
    loadUserRankings();
  }
  
  // Inicializar tooltips
  initializeTooltips();
});

// Função para carregar os rankings do usuário
async function loadUserRankings() {
  try {
    showLoading(rankingsList);
    
    const response = await axios.get('/api/rankings/user');
    const rankings = response.data;
    
    renderRankings(rankings);
  } catch (error) {
    console.error('Erro ao carregar rankings:', error);
    showAlert('Erro ao carregar rankings. Tente novamente.', 'error');
  } finally {
    removeLoading(rankingsList);
  }
}

// Função para renderizar a lista de rankings
function renderRankings(rankings) {
  if (!rankingsList) return;
  
  if (rankings.length === 0) {
    rankingsList.innerHTML = `
      <div class="col-span-3 text-center py-12">
        <i class="fas fa-trophy text-4xl text-gray-300 mb-4"></i>
        <h3 class="text-lg font-medium text-gray-700 mb-2">Nenhum ranking encontrado</h3>
        <p class="text-gray-500">Crie seu primeiro ranking para começar</p>
      </div>
    `;
    return;
  }
  
  rankingsList.innerHTML = rankings.map(ranking => `
    <div class="ranking-card fade-in">
      <div class="ranking-card-header">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-bold text-lg text-gray-800">${ranking.name}</h3>
            <span class="text-sm text-gray-500">
              ${ranking.participants.length} participante${ranking.participants.length !== 1 ? 's' : ''}
            </span>
          </div>
          <span class="badge ${ranking.isPublic ? 'badge-public' : 'badge-private'}">
            ${ranking.isPublic ? 'Público' : 'Privado'}
          </span>
        </div>
        <p class="mt-2 text-gray-600 text-sm line-clamp-2">${ranking.description || 'Sem descrição'}</p>
      </div>
      <div class="ranking-card-body">
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-500">
            Criado em ${new Date(ranking.createdAt).toLocaleDateString()}
          </span>
          <div class="flex space-x-2">
            <button class="view-ranking-btn p-2 text-indigo-600 hover:bg-indigo-50 rounded-full" 
                    data-id="${ranking._id}" 
                    title="Visualizar ranking">
              <i class="fas fa-eye"></i>
            </button>
            <button class="edit-ranking-btn p-2 text-yellow-600 hover:bg-yellow-50 rounded-full" 
                    data-id="${ranking._id}" 
                    title="Editar ranking">
              <i class="fas fa-edit"></i>
            </button>
            <button class="delete-ranking-btn p-2 text-red-600 hover:bg-red-50 rounded-full" 
                    data-id="${ranking._id}" 
                    title="Excluir ranking">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
  
  // Adicionar event listeners aos botões
  document.querySelectorAll('.view-ranking-btn').forEach(btn => {
    btn.addEventListener('click', () => viewRanking(btn.dataset.id));
  });
  
  document.querySelectorAll('.edit-ranking-btn').forEach(btn => {
    btn.addEventListener('click', () => editRanking(btn.dataset.id));
  });
  
  document.querySelectorAll('.delete-ranking-btn').forEach(btn => {
    btn.addEventListener('click', () => confirmDeleteRanking(btn.dataset.id));
  });
}

// Função para visualizar um ranking
async function viewRanking(rankingId) {
  try {
    showLoading(viewRankingModal);
    
    const response = await axios.get(`/api/rankings/${rankingId}/leaderboard`);
    const ranking = response.data;
    
    // Atualizar o modal com os dados do ranking
    document.getElementById('view-ranking-title').textContent = ranking.name;
    document.getElementById('view-ranking-description').textContent = ranking.description || 'Sem descrição';
    
    // Renderizar participantes
    const participantsTable = document.getElementById('participants-table-body');
    participantsTable.innerHTML = ranking.participants.map((participant, index) => `
      <tr class="participant-row">
        <td class="py-3 px-4 border-b">
          <span class="participant-position">${index + 1}º</span>
        </td>
        <td class="py-3 px-4 border-b">${participant.name}</td>
        <td class="py-3 px-4 border-b text-right font-medium">${participant.score.toFixed(2)}</td>
        <td class="py-3 px-4 border-b text-center">
          <button class="edit-participant-btn p-1 text-blue-600 hover:text-blue-800 mr-2" 
                  data-id="${participant._id}" 
                  data-name="${participant.name}" 
                  data-score="${participant.score}"
                  title="Editar pontuação">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-participant-btn p-1 text-red-600 hover:text-red-800" 
                  data-id="${participant._id}" 
                  data-name="${participant.name}"
                  title="Remover participante">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
    
    // Adicionar event listeners aos botões de editar/remover participantes
    document.querySelectorAll('.edit-participant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        editParticipant(
          rankingId,
          btn.dataset.id,
          btn.dataset.name,
          parseFloat(btn.dataset.score)
        );
      });
    });
    
    document.querySelectorAll('.delete-participant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        confirmDeleteParticipant(rankingId, btn.dataset.id, btn.dataset.name);
      });
    });
    
    // Atualizar o ID do ranking atual
    currentRankingId = rankingId;
    
    // Mostrar o modal
    viewRankingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
  } catch (error) {
    console.error('Erro ao carregar ranking:', error);
    showAlert('Erro ao carregar o ranking. Tente novamente.', 'error');
  } finally {
    removeLoading(viewRankingModal);
  }
}

// Função para criar um novo ranking
async function createRanking(rankingData) {
  try {
    const response = await axios.post('/api/rankings', rankingData);
    showAlert('Ranking criado com sucesso!', 'success');
    await loadUserRankings();
    return response.data;
  } catch (error) {
    console.error('Erro ao criar ranking:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao criar ranking. Tente novamente.';
    showAlert(errorMessage, 'error');
    throw error;
  }
}

// Função para atualizar um ranking
async function updateRanking(rankingId, rankingData) {
  try {
    const response = await axios.put(`/api/rankings/${rankingId}`, rankingData);
    showAlert('Ranking atualizado com sucesso!', 'success');
    await loadUserRankings();
    return response.data;
  } catch (error) {
    console.error('Erro ao atualizar ranking:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar ranking. Tente novamente.';
    showAlert(errorMessage, 'error');
    throw error;
  }
}

// Função para excluir um ranking
async function deleteRanking(rankingId) {
  try {
    await axios.delete(`/api/rankings/${rankingId}`);
    showAlert('Ranking excluído com sucesso!', 'success');
    
    // Se o ranking excluído está sendo visualizado, fechar o modal
    if (currentRankingId === rankingId) {
      closeViewRankingModal();
    }
    
    // Recarregar a lista de rankings
    await loadUserRankings();
  } catch (error) {
    console.error('Erro ao excluir ranking:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao excluir ranking. Tente novamente.';
    showAlert(errorMessage, 'error');
  }
}

// Função para adicionar um participante
async function addParticipant(rankingId, participantData) {
  try {
    const response = await axios.post(`/api/rankings/${rankingId}/participants`, participantData);
    showAlert('Participante adicionado com sucesso!', 'success');
    
    // Se o ranking está sendo visualizado, atualizar a visualização
    if (currentRankingId === rankingId) {
      await viewRanking(rankingId);
    } else {
      await loadUserRankings();
    }
    
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao adicionar participante. Tente novamente.';
    showAlert(errorMessage, 'error');
    throw error;
  }
}

// Função para atualizar a pontuação de um participante
async function updateParticipantScore(rankingId, participantId, score) {
  try {
    await axios.put(`/api/rankings/${rankingId}/participants/${participantId}`, { score });
    showAlert('Pontuação atualizada com sucesso!', 'success');
    
    // Atualizar a visualização do ranking
    if (currentRankingId === rankingId) {
      await viewRanking(rankingId);
    }
  } catch (error) {
    console.error('Erro ao atualizar pontuação:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao atualizar pontuação. Tente novamente.';
    showAlert(errorMessage, 'error');
    throw error;
  }
}

// Função para remover um participante
async function removeParticipant(rankingId, participantId) {
  try {
    // Nota: Esta rota precisa ser implementada no backend
    await axios.delete(`/api/rankings/${rankingId}/participants/${participantId}`);
    showAlert('Participante removido com sucesso!', 'success');
    
    // Atualizar a visualização do ranking
    if (currentRankingId === rankingId) {
      await viewRanking(rankingId);
    }
  } catch (error) {
    console.error('Erro ao remover participante:', error);
    const errorMessage = error.response?.data?.message || 'Erro ao remover participante. Tente novamente.';
    showAlert(errorMessage, 'error');
    throw error;
  }
}

// Função para adicionar um critério ao formulário
function addCriteriaField(name = '', weight = 1) {
  const criteriaId = `criteria-${Date.now()}`;
  const criteriaItem = document.createElement('div');
  criteriaItem.className = 'flex items-center mb-2';
  criteriaItem.dataset.id = criteriaId;
  
  criteriaItem.innerHTML = `
    <input type="text" 
           placeholder="Nome do critério" 
           class="criteria-name flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-indigo-200"
           value="${name}"
           required>
    <input type="number" 
           min="1" 
           max="100" 
           value="${weight}"
           class="criteria-weight w-20 p-2 border-t border-b border-r border-l-0 focus:outline-none focus:ring-2 focus:ring-indigo-200"
           required>
    <button type="button" 
            class="remove-criteria p-2 bg-red-500 text-white rounded-r hover:bg-red-600 focus:outline-none">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  criteriaList.appendChild(criteriaItem);
  
  // Adicionar event listener ao botão de remover
  const removeBtn = criteriaItem.querySelector('.remove-criteria');
  removeBtn.addEventListener('click', () => {
    criteriaItem.remove();
  });
  
  return criteriaItem;
}

// Função para obter os critérios do formulário
function getFormCriteria() {
  const criteriaItems = criteriaList.querySelectorAll('[data-id]');
  return Array.from(criteriaItems).map(item => ({
    name: item.querySelector('.criteria-name').value,
    weight: parseInt(item.querySelector('.criteria-weight').value) || 1
  }));
}

// Função para confirmar a exclusão de um ranking
function confirmDeleteRanking(rankingId) {
  Swal.fire({
    title: 'Tem certeza?',
    text: "Você não poderá reverter isso!",
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sim, excluir!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      deleteRanking(rankingId);
    }
  });
}

// Função para confirmar a remoção de um participante
function confirmDeleteParticipant(rankingId, participantId, participantName) {
  Swal.fire({
    title: 'Remover participante',
    text: `Tem certeza que deseja remover ${participantName}?`,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#6b7280',
    confirmButtonText: 'Sim, remover!',
    cancelButtonText: 'Cancelar'
  }).then((result) => {
    if (result.isConfirmed) {
      removeParticipant(rankingId, participantId);
    }
  });
}

// Função para editar um ranking
async function editRanking(rankingId) {
  try {
    showLoading(rankingModal);
    
    const response = await axios.get(`/api/rankings/${rankingId}`);
    const ranking = response.data;
    
    // Preencher o formulário com os dados do ranking
    document.getElementById('modal-title').textContent = 'Editar Ranking';
    document.getElementById('ranking-id').value = ranking._id;
    document.getElementById('ranking-name').value = ranking.name;
    document.getElementById('ranking-description').value = ranking.description || '';
    document.getElementById('ranking-public').checked = ranking.isPublic;
    
    // Limpar critérios existentes
    criteriaList.innerHTML = '';
    
    // Adicionar critérios ao formulário
    if (ranking.criteria && ranking.criteria.length > 0) {
      ranking.criteria.forEach(criteria => {
        addCriteriaField(criteria.name, criteria.weight);
      });
    } else {
      // Adicionar um campo de critério vazio por padrão
      addCriteriaField();
    }
    
    // Mostrar o modal
    rankingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
  } catch (error) {
    console.error('Erro ao carregar ranking para edição:', error);
    showAlert('Erro ao carregar o ranking para edição. Tente novamente.', 'error');
  } finally {
    removeLoading(rankingModal);
  }
}

// Função para editar um participante
function editParticipant(rankingId, participantId, name, score) {
  // Preencher o formulário com os dados do participante
  document.getElementById('participant-modal-title').textContent = 'Editar Pontuação';
  document.getElementById('participant-id').value = participantId;
  document.getElementById('participant-name').value = name;
  document.getElementById('participant-score').value = score;
  
  // Mostrar o modal
  participantModal.classList.remove('hidden');
  document.body.classList.add('overflow-hidden');
  
  // Atualizar o ID do participante atual
  currentParticipantId = participantId;
}

// Função para fechar o modal de visualização do ranking
function closeViewRankingModal() {
  viewRankingModal.classList.add('hidden');
  document.body.classList.remove('overflow-hidden');
  currentRankingId = null;
}

// Função para mostrar um indicador de carregamento
function showLoading(element) {
  if (!element) return;
  
  const loadingDiv = document.createElement('div');
  loadingDiv.className = 'flex justify-center items-center p-8';
  loadingDiv.innerHTML = `
    <div class="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  `;
  
  // Salvar o conteúdo original para restaurar depois
  element.setAttribute('data-original-content', element.innerHTML);
  element.innerHTML = '';
  element.appendChild(loadingDiv);
}

// Função para remover o indicador de carregamento
function removeLoading(element) {
  if (!element) return;
  
  const originalContent = element.getAttribute('data-original-content');
  if (originalContent) {
    element.innerHTML = originalContent;
    element.removeAttribute('data-original-content');
  }
}

// Função para inicializar tooltips
function initializeTooltips() {
  // Usar a biblioteca Tippy.js ou similar para tooltips
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
}

// Event Listeners
if (createRankingBtn) {
  createRankingBtn.addEventListener('click', () => {
    // Limpar o formulário
    document.getElementById('modal-title').textContent = 'Novo Ranking';
    document.getElementById('ranking-form').reset();
    criteriaList.innerHTML = '';
    
    // Adicionar um campo de critério vazio por padrão
    addCriteriaField();
    
    // Mostrar o modal
    rankingModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
  });
}

if (closeModalBtn) {
  closeModalBtn.addEventListener('click', () => {
    rankingModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });
}

if (cancelRankingBtn) {
  cancelRankingBtn.addEventListener('click', () => {
    rankingModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });
}

if (addCriteriaBtn) {
  addCriteriaBtn.addEventListener('click', () => {
    addCriteriaField();
  });
}

if (closeViewModalBtn) {
  closeViewModalBtn.addEventListener('click', closeViewRankingModal);
}

if (closeViewBtn) {
  closeViewBtn.addEventListener('click', closeViewRankingModal);
}

if (closeParticipantModalBtn) {
  closeParticipantModalBtn.addEventListener('click', () => {
    participantModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });
}

if (cancelParticipantBtn) {
  cancelParticipantBtn.addEventListener('click', () => {
    participantModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  });
}

if (addParticipantBtn) {
  addParticipantBtn.addEventListener('click', () => {
    // Limpar o formulário
    document.getElementById('participant-modal-title').textContent = 'Adicionar Participante';
    document.getElementById('participant-form').reset();
    
    // Mostrar o modal
    participantModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');
    
    // Limpar o ID do participante atual
    currentParticipantId = null;
  });
}

// Formulário de ranking
if (rankingForm) {
  rankingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(rankingForm);
    const rankingData = {
      name: formData.get('name'),
      description: formData.get('description'),
      isPublic: document.getElementById('ranking-public').checked,
      criteria: getFormCriteria()
    };
    
    try {
      const rankingId = document.getElementById('ranking-id').value;
      
      if (rankingId) {
        // Atualizar ranking existente
        await updateRanking(rankingId, rankingData);
      } else {
        // Criar novo ranking
        await createRanking(rankingData);
      }
      
      // Fechar o modal
      rankingModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
    } catch (error) {
      // Erro já tratado nas funções específicas
    }
  });
}

// Formulário de participante
if (participantForm) {
  participantForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const participantData = {
      name: document.getElementById('participant-name').value,
      score: parseFloat(document.getElementById('participant-score').value)
    };
    
    try {
      if (currentParticipantId) {
        // Atualizar pontuação do participante existente
        await updateParticipantScore(currentRankingId, currentParticipantId, participantData.score);
      } else {
        // Adicionar novo participante
        await addParticipant(currentRankingId, participantData);
      }
      
      // Fechar o modal
      participantModal.classList.add('hidden');
      document.body.classList.remove('overflow-hidden');
      
    } catch (error) {
      // Erro já tratado nas funções específicas
    }
  });
}

// Fechar modais ao clicar fora
document.addEventListener('click', (e) => {
  if (e.target === rankingModal) {
    rankingModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
  
  if (e.target === viewRankingModal) {
    closeViewRankingModal();
  }
  
  if (e.target === participantModal) {
    participantModal.classList.add('hidden');
    document.body.classList.remove('overflow-hidden');
  }
});

// Exportar funções para uso em outros arquivos
window.rankings = {
  loadUserRankings,
  viewRanking,
  createRanking,
  updateRanking,
  deleteRanking,
  addParticipant,
  updateParticipantScore,
  removeParticipant
};
