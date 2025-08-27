const Ranking = require('../models/Ranking');
const { validationResult } = require('express-validator');

// Criar um novo ranking
exports.createRanking = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, isPublic, criteria } = req.body;
    
    const newRanking = new Ranking({
      name,
      description,
      isPublic: isPublic !== undefined ? isPublic : true,
      criteria: criteria || [],
      createdBy: req.user.id,
      participants: []
    });

    await newRanking.save();
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
    const skip = (page - 1) * limit;

    // Construir query
    const query = {
      $or: [
        { isPublic: true },
        { createdBy: req.user.id }
      ]
    };

    // Adicionar busca por texto se fornecida
    if (search) {
      query.$text = { $search: search };
    }

    const rankings = await Ranking.find(query)
      .populate('createdBy', 'username')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Ranking.countDocuments(query);

    res.json({
      rankings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
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
    
    const ranking = await Ranking.findById(id).populate('createdBy', 'username');
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar se o usuário tem permissão para ver este ranking
    if (!ranking.isPublic && ranking.createdBy._id.toString() !== req.user.id && req.user.role !== 'admin') {
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

    const ranking = await Ranking.findById(id);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    // Atualizar campos
    if (name !== undefined) ranking.name = name;
    if (description !== undefined) ranking.description = description;
    if (isPublic !== undefined) ranking.isPublic = isPublic;
    if (criteria !== undefined) ranking.criteria = criteria;

    await ranking.save();
    res.json(ranking);
  } catch (error) {
    console.error('Erro ao atualizar ranking:', error);
    res.status(500).json({ message: 'Erro ao atualizar ranking', error: error.message });
  }
};

// Excluir ranking
exports.deleteRanking = async (req, res) => {
  try {
    const { id } = req.params;

    const ranking = await Ranking.findById(id);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    await Ranking.findByIdAndDelete(id);
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

    const ranking = await Ranking.findById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const participant = {
      name,
      score: score || 0,
      metadata: metadata || {}
    };

    ranking.participants.push(participant);
    await ranking.save();

    res.status(201).json(ranking);
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

    const ranking = await Ranking.findById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const participant = ranking.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participante não encontrado' });
    }

    participant.score = score;
    await ranking.save();

    res.json(ranking);
  } catch (error) {
    console.error('Erro ao atualizar pontuação:', error);
    res.status(500).json({ message: 'Erro ao atualizar pontuação', error: error.message });
  }
};

// Obter rankings por usuário
exports.getUserRankings = async (req, res) => {
  try {
    const rankings = await Ranking.find({ createdBy: req.user.id })
      .sort({ updatedAt: -1 });
    
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

    const ranking = await Ranking.findById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar permissões
    if (ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Não autorizado' });
    }

    const participant = ranking.participants.id(participantId);
    if (!participant) {
      return res.status(404).json({ message: 'Participante não encontrado' });
    }

    ranking.participants.pull(participantId);
    await ranking.save();

    res.json({ message: 'Participante removido com sucesso', ranking });
  } catch (error) {
    console.error('Erro ao remover participante:', error);
    res.status(500).json({ message: 'Erro ao remover participante', error: error.message });
  }
};

// Obter ranking com participantes ordenados
exports.getRankingWithParticipants = async (req, res) => {
  try {
    const { rankingId } = req.params;
    
    const ranking = await Ranking.findById(rankingId);
    if (!ranking) {
      return res.status(404).json({ message: 'Ranking não encontrado' });
    }

    // Verificar se o ranking é público ou se o usuário tem permissão
    if (!ranking.isPublic && ranking.createdBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Acesso negado' });
    }

    // Ordenar participantes por pontuação (decrescente)
    const sortedParticipants = [...ranking.participants].sort((a, b) => b.score - a.score);
    
    res.json({
      ...ranking.toObject(),
      participants: sortedParticipants
    });
  } catch (error) {
    console.error('Erro ao buscar ranking com participantes:', error);
    res.status(500).json({ message: 'Erro ao buscar ranking', error: error.message });
  }
};
