const mongoose = require('mongoose');

const rankingSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  participants: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    score: {
      type: Number,
      default: 0
    },
    metadata: {}
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  criteria: [{
    name: String,
    weight: {
      type: Number,
      min: 0,
      max: 100,
      default: 1
    }
  }]
}, {
  timestamps: true
});

// Índice para buscas por nome
rankingSchema.index({ name: 'text', description: 'text' });

// Método para adicionar um participante
rankingSchema.methods.addParticipant = async function(participantData) {
  this.participants.push(participantData);
  return this.save();
};

// Método para atualizar a pontuação de um participante
rankingSchema.methods.updateScore = async function(participantId, score) {
  const participant = this.participants.id(participantId);
  if (!participant) throw new Error('Participante não encontrado');
  
  participant.score = score;
  return this.save();
};

// Middleware para ordenar participantes por pontuação
rankingSchema.pre('save', function(next) {
  this.participants.sort((a, b) => b.score - a.score);
  next();
});

const Ranking = mongoose.model('Ranking', rankingSchema);

module.exports = Ranking;
