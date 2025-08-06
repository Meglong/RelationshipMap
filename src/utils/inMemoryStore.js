// In-memory data store for demo purposes
const { demoUsers, demoRelationships, demoInteractions } = require('./demoData');

class InMemoryStore {
  constructor() {
    this.users = [...demoUsers];
    this.relationships = [...demoRelationships];
    this.interactions = [...demoInteractions];
    console.log(`InMemoryStore initialized with ${this.users.length} users, ${this.relationships.length} relationships, and ${this.interactions.length} interactions`);
  }

  // User methods
  async findUser(query) {
    return this.users.find(user => 
      user.slackUserId === query.slackUserId || 
      user.email === query.email
    );
  }

  async findUsers(query = {}) {
    let filteredUsers = this.users;
    
    if (query.slackTeamId) {
      filteredUsers = filteredUsers.filter(user => user.slackTeamId === query.slackTeamId);
    }
    
    if (query.isDeleted !== undefined) {
      filteredUsers = filteredUsers.filter(user => user.isDeleted === query.isDeleted);
    }
    
    if (query.$or) {
      const searchTerms = query.$or[0];
      filteredUsers = filteredUsers.filter(user => {
        return Object.keys(searchTerms).some(key => {
          const searchValue = searchTerms[key].$regex;
          const userValue = key.includes('.') 
            ? key.split('.').reduce((obj, k) => obj?.[k], user)
            : user[key];
          return userValue && userValue.toLowerCase().includes(searchValue.toLowerCase());
        });
      });
    }
    
    return filteredUsers;
  }

  async createUser(userData) {
    const newUser = { ...userData, _id: Date.now().toString() };
    this.users.push(newUser);
    return newUser;
  }

  async updateUser(query, updateData) {
    const userIndex = this.users.findIndex(user => user.slackUserId === query.slackUserId);
    if (userIndex !== -1) {
      this.users[userIndex] = { ...this.users[userIndex], ...updateData };
      return this.users[userIndex];
    }
    return null;
  }

  // Relationship methods
  async findRelationships(query = {}) {
    let filteredRelationships = this.relationships;
    
    console.log('findRelationships query:', query);
    console.log('Total relationships before filtering:', filteredRelationships.length);
    
    if (query.userId) {
      filteredRelationships = filteredRelationships.filter(rel => rel.userId === query.userId);
      console.log('After userId filter:', filteredRelationships.length);
    }
    
    if (query.teamId) {
      filteredRelationships = filteredRelationships.filter(rel => rel.teamId === query.teamId);
      console.log('After teamId filter:', filteredRelationships.length);
    }
    
    if (query.isActive !== undefined) {
      filteredRelationships = filteredRelationships.filter(rel => {
        // Default to true if isActive is not set
        const isActive = rel.isActive !== undefined ? rel.isActive : true;
        return isActive === query.isActive;
      });
      console.log('After isActive filter:', filteredRelationships.length);
    }
    
    // Populate contact data
    const result = filteredRelationships.map(rel => ({
      ...rel,
      contactId: this.users.find(user => user.slackUserId === rel.contactId)
    }));
    
    console.log('Final result count:', result.length);
    return result;
  }

  async findRelationship(query) {
    const relationship = this.relationships.find(rel => 
      rel.userId === query.userId && 
      rel.contactId === query.contactId &&
      rel.isActive !== false
    );
    
    if (relationship) {
      return {
        ...relationship,
        contactId: this.users.find(user => user.slackUserId === relationship.contactId)
      };
    }
    return null;
  }

  async createRelationship(relationshipData) {
    const newRelationship = { 
      ...relationshipData, 
      _id: Date.now().toString(),
      metadata: {
        addedAt: new Date(),
        lastUpdated: new Date()
      }
    };
    this.relationships.push(newRelationship);
    return newRelationship;
  }

  async updateRelationship(query, updateData) {
    const relIndex = this.relationships.findIndex(rel => 
      rel.userId === query.userId && 
      rel.contactId === query.contactId
    );
    if (relIndex !== -1) {
      this.relationships[relIndex] = { 
        ...this.relationships[relIndex], 
        ...updateData,
        metadata: {
          ...this.relationships[relIndex].metadata,
          lastUpdated: new Date()
        }
      };
      return this.relationships[relIndex];
    }
    return null;
  }

  // Interaction methods
  async findInteractions(query = {}) {
    let filteredInteractions = this.interactions;
    
    if (query.userId) {
      filteredInteractions = filteredInteractions.filter(int => int.userId === query.userId);
    }
    
    if (query.contactId) {
      filteredInteractions = filteredInteractions.filter(int => int.contactId === query.contactId);
    }
    
    if (query.channelType) {
      filteredInteractions = filteredInteractions.filter(int => int.channelType === query.channelType);
    }
    
    if (query.messageTimestamp) {
      filteredInteractions = filteredInteractions.filter(int => {
        if (query.messageTimestamp.$gte) {
          return int.messageTimestamp >= query.messageTimestamp.$gte;
        }
        return true;
      });
    }
    
    return filteredInteractions;
  }

  async countInteractions(query = {}) {
    const interactions = await this.findInteractions(query);
    return interactions.length;
  }

  async distinctInteractions(field, query = {}) {
    const interactions = await this.findInteractions(query);
    return [...new Set(interactions.map(int => int[field]))];
  }

  // Reset data
  async resetData() {
    this.users = [...demoUsers];
    this.relationships = [...demoRelationships];
    this.interactions = [...demoInteractions];
    console.log(`Data reset: ${this.users.length} users, ${this.relationships.length} relationships, ${this.interactions.length} interactions`);
    return {
      users: this.users.length,
      relationships: this.relationships.length,
      interactions: this.interactions.length
    };
  }

  // Debug method to check data
  async debugData() {
    console.log('=== InMemoryStore Debug ===');
    console.log(`Users: ${this.users.length}`);
    console.log(`Relationships: ${this.relationships.length}`);
    console.log(`Interactions: ${this.interactions.length}`);
    
    // Show first few relationships
    console.log('First 3 relationships:');
    this.relationships.slice(0, 3).forEach((rel, i) => {
      console.log(`${i + 1}. ${rel.userId} -> ${rel.contactId} (${rel.relationshipType})`);
    });
    
    return {
      users: this.users.length,
      relationships: this.relationships.length,
      interactions: this.interactions.length
    };
  }
}

module.exports = new InMemoryStore(); 