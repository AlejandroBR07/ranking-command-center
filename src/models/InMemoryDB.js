// Banco de dados em memória para demonstração (substitui MongoDB temporariamente)
class InMemoryDB {
  constructor() {
    this.users = [];
    this.rankings = [];
    this.nextUserId = 1;
    this.nextRankingId = 1;
  }

  // Métodos para usuários
  async createUser(userData) {
    const user = {
      _id: this.nextUserId++,
      ...userData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.push(user);
    return user;
  }

  async findUserByEmail(email) {
    return this.users.find(user => user.email === email);
  }

  async findUserByUsername(username) {
    return this.users.find(user => user.username === username);
  }

  async findUserByEmailOrUsername(email, username) {
    return this.users.find(user => user.email === email || user.username === username);
  }

  async findUserById(id) {
    return this.users.find(user => user._id == id);
  }

  // Métodos para rankings
  async createRanking(rankingData) {
    const ranking = {
      _id: this.nextRankingId++,
      ...rankingData,
      participants: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.rankings.push(ranking);
    return ranking;
  }

  async findRankings(query = {}) {
    let results = [...this.rankings];
    
    if (query.createdBy) {
      results = results.filter(r => r.createdBy == query.createdBy);
    }
    
    if (query.$or) {
      const orConditions = query.$or;
      results = results.filter(r => {
        return orConditions.some(condition => {
          if (condition.isPublic !== undefined) {
            return r.isPublic === condition.isPublic;
          }
          if (condition.createdBy !== undefined) {
            return r.createdBy == condition.createdBy;
          }
          return false;
        });
      });
    }
    
    return results.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }

  async findRankingById(id) {
    return this.rankings.find(r => r._id == id);
  }

  async updateRanking(id, updates) {
    const ranking = this.rankings.find(r => r._id == id);
    if (ranking) {
      Object.assign(ranking, updates, { updatedAt: new Date() });
      return ranking;
    }
    return null;
  }

  async deleteRanking(id) {
    const index = this.rankings.findIndex(r => r._id == id);
    if (index !== -1) {
      return this.rankings.splice(index, 1)[0];
    }
    return null;
  }

  async addParticipant(rankingId, participantData) {
    const ranking = this.rankings.find(r => r._id == rankingId);
    if (ranking) {
      const participant = {
        _id: Date.now() + Math.random(),
        ...participantData
      };
      ranking.participants.push(participant);
      ranking.updatedAt = new Date();
      return ranking;
    }
    return null;
  }

  async updateParticipantScore(rankingId, participantId, score) {
    const ranking = this.rankings.find(r => r._id == rankingId);
    if (ranking) {
      const participant = ranking.participants.find(p => p._id == participantId);
      if (participant) {
        participant.score = score;
        ranking.updatedAt = new Date();
        // Ordenar participantes por pontuação
        ranking.participants.sort((a, b) => b.score - a.score);
        return ranking;
      }
    }
    return null;
  }

  async removeParticipant(rankingId, participantId) {
    const ranking = this.rankings.find(r => r._id == rankingId);
    if (ranking) {
      const index = ranking.participants.findIndex(p => p._id == participantId);
      if (index !== -1) {
        ranking.participants.splice(index, 1);
        ranking.updatedAt = new Date();
        return ranking;
      }
    }
    return null;
  }
}

// Instância singleton
const db = new InMemoryDB();

module.exports = db;
