const express = require('express');
const { check } = require('express-validator');
const rankingController = require('../controllers/rankingController');
const authController = require('../controllers/authController');

const router = express.Router();

// Aplicar middleware de autenticação em todas as rotas
router.use(authController.authenticate);

// @route   GET /api/rankings
// @desc    Obter todos os rankings públicos e do usuário
// @access  Privado
router.get('/', rankingController.getRankings);

// @route   POST /api/rankings
// @desc    Criar um novo ranking
// @access  Privado
router.post(
  '/',
  [
    check('name', 'O nome do ranking é obrigatório').not().isEmpty(),
    check('description', 'A descrição é obrigatória').optional(),
    check('isPublic', 'Visibilidade inválida').optional().isBoolean(),
    check('criteria', 'Critérios inválidos').optional().isArray()
  ],
  rankingController.createRanking
);

// @route   GET /api/rankings/user
// @desc    Obter rankings do usuário atual
// @access  Privado
router.get('/user', rankingController.getUserRankings);

// @route   GET /api/rankings/:id
// @desc    Obter ranking por ID
// @access  Privado
router.get('/:id', rankingController.getRanking);

// @route   PUT /api/rankings/:id
// @desc    Atualizar ranking
// @access  Privado
router.put(
  '/:id',
  [
    check('name', 'O nome do ranking é obrigatório').optional().not().isEmpty(),
    check('description', 'A descrição é obrigatória').optional(),
    check('isPublic', 'Visibilidade inválida').optional().isBoolean(),
    check('criteria', 'Critérios inválidos').optional().isArray()
  ],
  rankingController.updateRanking
);

// @route   DELETE /api/rankings/:id
// @desc    Excluir ranking
// @access  Privado
router.delete('/:id', rankingController.deleteRanking);

// @route   POST /api/rankings/:rankingId/participants
// @desc    Adicionar participante ao ranking
// @access  Privado
router.post(
  '/:rankingId/participants',
  [
    check('name', 'O nome do participante é obrigatório').not().isEmpty(),
    check('score', 'A pontuação deve ser um número').optional().isNumeric(),
    check('metadata', 'Metadados inválidos').optional().isObject()
  ],
  rankingController.addParticipant
);

// @route   PUT /api/rankings/:rankingId/participants/:participantId
// @desc    Atualizar pontuação do participante
// @access  Privado
router.put(
  '/:rankingId/participants/:participantId',
  [
    check('score', 'A pontuação é obrigatória').isNumeric()
  ],
  rankingController.updateParticipantScore
);

// @route   DELETE /api/rankings/:rankingId/participants/:participantId
// @desc    Remover participante do ranking
// @access  Privado
router.delete('/:rankingId/participants/:participantId', rankingController.removeParticipant);

// @route   GET /api/rankings/:id/leaderboard
// @desc    Obter ranking com participantes ordenados
// @access  Privado
router.get('/:id/leaderboard', rankingController.getRankingWithParticipants);

module.exports = router;
