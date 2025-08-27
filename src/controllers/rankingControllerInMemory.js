const { validationResult } = require('express-validator');
const db = require('../models/InMemoryDB');

// Criar um novo ranking
exports.createRanking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPublic, criteria } = req.body;
    
    const newRanking = await db.createRanking({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      criteria: criteria || [],
      createdBy: req.user.id
    });

    res.status(201).json(newRanking);
  } catch (error) {
    console.error('Erro ao criar ranking:', error);
    res.status(500).json({ message: 'Erro ao criar ranking', error: error.message });
  }
};

// Obter todos os rankings públicos e do usuário
exports.getRankings = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;

    // Construir query
    const query = {
      $or: [
        { isPublic: true },
        { createdBy: req.user.id }
      ]
    };

    const rankings = await db.findRankings(query);

    // Filtrar por busca se fornecida
    let filteredRankings = rankings;
    if (search) {
      filteredRankings = rankings.filter(ranking => 
        ranking.name.toLowerCase().includes(search.toLowerCase()) ||
        (ranking.description && ranking.description.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Paginação
    const skip = (page - 1) * limit;
    const paginatedRankings = filteredRankings.slice(skip, skip + parseInt(limit));

    res.json({
      rankings: paginatedRankings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(filteredRankings.length / limit),
        total: filteredRankings.length
      }
    });
  } catch (error) {
    console.error('Erro ao buscar rankings:', error);
    res.status(500).json({ message: 'Erro ao buscar rankings', error: error.message });
  }
};

// Obter ranking por ID
exports.getRanking = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ranking = await db.findRankingById(id);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar se o usuário tem permissão para ver este ranking
    if (!ranking.isPublic && ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao buscar ranking:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking', error: error.message });
  }
};

// Atualizar ranking
exports.updateRanking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, description, isPublic, criteria } = req.body;

    const ranking = await db.findRankingById(id);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Preparar atualizações
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (isPublic !== undefined) updates.isPublic = isPublic;
    if (criteria !== undefined) updates.criteria = criteria;

    const updatedRanking = await db.updateRanking(id, updates);
    res.json(updatedRanking);
  } catch (error) {
    console.error('Erro ao atualizar ranking:', error);
    res.status(500).json({ message: 'Erro ao atualizar ranking', error: error.message });
  }
};

// Excluir ranking
exports.deleteRanking = async (req, res) => {
  try {
    const { id } = req.params;

    const ranking = await db.findRankingById(id);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await db.deleteRanking(id);
    res.json({ message: 'Ranking excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir ranking:', error);
    res.status(500).json({ message: 'Erro ao excluir ranking', error: error.message });
  }
};

// Adicionar participante ao ranking
exports.addParticipant = async (req, res) => {
  try {
    const { rankingId } = req.params;
    const { name, score, metadata } = req.body;

    const ranking = await db.findRankingById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const participant = {
      name,
      score: score || 0,
      metadata: metadata || {}
    };

    const updatedRanking = await db.addParticipant(rankingId, participant);
    res.status(201).json(updatedRanking);
  } catch (error) {
    console.error('Erro ao adicionar participante:', error);
    res.status(500).json({ message: 'Erro ao adicionar participante', error: error.message });
  }
};

// Atualizar pontuação do participante
exports.updateParticipantScore = async (req, res) => {
  try {
    const { rankingId, participantId } = req.params;
    const { score } = req.body;

    const ranking = await db.findRankingById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const updatedRanking = await db.updateParticipantScore(rankingId, participantId, score);
    if (!updatedRanking) {
      return res.status(404).json({ message: 'Participante não encontrado' });
    }

    res.json(updatedRanking);
  } catch (error) {
    console.error('Erro ao atualizar pontuação:', error);
    res.status(500).json({ message: 'Erro ao atualizar pontuação', error: error.message });
  }
};

// Obter rankings por usuário
exports.getUserRankings = async (req, res) => {
  try {
    const rankings = await db.findRankings({ createdBy: req.user.id });
    res.json(rankings);
  } catch (error) {
    console.error('Erro ao buscar rankings do usuário:', error);
    res.status(500).json({ message: 'Erro ao buscar rankings', error: error.message });
  }
};

// Remover participante do ranking
exports.removeParticipant = async (req, res) => {
  try {
    const { rankingId, participantId } = req.params;

    const ranking = await db.findRankingById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const updatedRanking = await db.removeParticipant(rankingId, participantId);
    if (!updatedRanking) {
      return res.status(404).json({ message: 'Participante não encontrado' });
    }

    res.json({ message: 'Participante removido com sucesso', ranking: updatedRanking });
  } catch (error) {
    console.error('Erro ao remover participante:', error);
    res.status(500).json({ message: 'Erro ao remover participante', error: error.message });
  }
};

// Obter ranking com participantes ordenados
exports.getRankingWithParticipants = async (req, res) => {
  try {
    const { rankingId } = req.params;
    
    const ranking = await db.findRankingById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar se o ranking é público ou se o usuário tem permissão
    if (!ranking.isPublic && ranking.createdBy != req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Ordenar participantes por pontuação (decrescente)
    const sortedParticipants = [...ranking.participants].sort((a, b) => b.score - a.score);
    
    res.json({
      ...ranking,
      participants: sortedParticipants
    });
  } catch (error) {
    console.error('Erro ao buscar ranking com participantes:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking', error: error.message });
  }
};
