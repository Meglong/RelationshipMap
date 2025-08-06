const express = require('express');
const axios = require('axios');
const inMemoryStore = require('../utils/inMemoryStore');

const router = express.Router();

// Get user's relationship map
router.get('/map', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    
    console.log(`Fetching relationships for user: ${userId}, team: ${teamId}`);
    console.log('User object:', req.user);
    
    const relationships = await inMemoryStore.findRelationships({
      userId,
      teamId,
      isActive: true
    });

    console.log(`Found ${relationships.length} relationships`);
    console.log('First relationship:', relationships[0]);

    // Get interaction data for each relationship
    const relationshipsWithData = await Promise.all(
      relationships.map(async (rel) => {
        const lastInteraction = await inMemoryStore.findInteractions({
          userId,
          contactId: rel.contactId.slackUserId
        }).then(interactions => 
          interactions.sort((a, b) => new Date(b.messageTimestamp) - new Date(a.messageTimestamp))[0]
        );

        const sharedChannels = rel.sharedChannels || [];
        
        return {
          id: rel._id,
          contact: rel.contactId,
          relationshipType: rel.relationshipType,
          customRelationshipType: rel.customRelationshipType,
          addedVia: rel.addedVia,
          lastInteraction: lastInteraction?.messageTimestamp,
          interactionCount: rel.interactionCount,
          sharedChannels,
          sharedInterests: rel.sharedInterests,
          notes: rel.notes,
          tags: rel.tags,
          addedAt: rel.addedAt || new Date() // Fixed: use rel.addedAt instead of rel.metadata.addedAt
        };
      })
    );

    console.log(`Returning ${relationshipsWithData.length} relationships with data`);
    res.json(relationshipsWithData);
  } catch (error) {
    console.error('Get relationship map error:', error);
    res.status(500).json({ error: 'Failed to get relationship map' });
  }
});

// Add individual contact
router.post('/add', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    const { contactId, relationshipType, customRelationshipType, notes, tags } = req.body;

    if (!contactId) {
      return res.status(400).json({ error: 'Contact ID is required' });
    }

    // Check if contact exists
    const contact = await inMemoryStore.findUser({ 
      slackUserId: contactId
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    // Check if relationship already exists
    const existingRelationship = await inMemoryStore.findRelationship({
      userId,
      contactId
    });

    if (existingRelationship) {
      return res.status(409).json({ error: 'Relationship already exists' });
    }

    // Get shared channels
    const sharedChannels = await getSharedChannels(userId, contactId);

    // Get shared interests
    const currentUser = await inMemoryStore.findUser({ slackUserId: userId });
    const sharedInterests = getSharedInterests(currentUser, contact);

    // Create relationship
    const relationship = await inMemoryStore.createRelationship({
      userId,
      teamId,
      contactId,
      relationshipType: relationshipType || 'colleague',
      customRelationshipType,
      addedVia: 'manual',
      sharedChannels,
      sharedInterests,
      notes,
      tags: tags || []
    });

    res.status(201).json(relationship);
  } catch (error) {
    console.error('Add relationship error:', error);
    res.status(500).json({ error: 'Failed to add relationship' });
  }
});

// Add team members from channel
router.post('/add-team', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    const { channelId, relationshipType } = req.body;

    if (!channelId) {
      return res.status(400).json({ error: 'Channel ID is required' });
    }

    // Get channel members from in-memory store
    const members = await getChannelMembers(channelId, userId);

    const addedRelationships = [];
    const errors = [];

    for (const memberId of members) {
      try {
        // Skip if it's the current user
        if (memberId === userId) continue;

        // Check if relationship already exists
        const existing = await inMemoryStore.findRelationship({
          userId,
          contactId: memberId
        });

        if (existing) continue;

        // Get contact info
        const contact = await inMemoryStore.findUser({ 
          slackUserId: memberId
        });

        if (!contact) continue;

        // Get shared channels and interests
        const sharedChannels = await getSharedChannels(userId, memberId);
        const currentUser = await inMemoryStore.findUser({ slackUserId: userId });
        const sharedInterests = getSharedInterests(currentUser, contact);

        const relationship = await inMemoryStore.createRelationship({
          userId,
          teamId,
          contactId: memberId,
          relationshipType: relationshipType || 'team_member',
          addedVia: 'channel_members',
          sourceChannel: channelId,
          sharedChannels,
          sharedInterests
        });

        addedRelationships.push(relationship);
      } catch (error) {
        errors.push({ memberId, error: error.message });
      }
    }

    res.json({
      added: addedRelationships.length,
      relationships: addedRelationships,
      errors
    });
  } catch (error) {
    console.error('Add team error:', error);
    res.status(500).json({ error: 'Failed to add team members' });
  }
});

// Add recent DM contacts
router.post('/add-recent-dms', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    const { days = 30 } = req.body;

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    // Get recent DM interactions
    const recentInteractions = await inMemoryStore.distinctInteractions('contactId', {
      userId,
      channelType: 'im',
      messageTimestamp: { $gte: cutoffDate }
    });

    const addedRelationships = [];
    const errors = [];

    for (const contactId of recentInteractions) {
      try {
        // Skip if relationship already exists
        const existing = await inMemoryStore.findRelationship({
          userId,
          contactId
        });

        if (existing) continue;

        // Get contact info
        const contact = await inMemoryStore.findUser({ 
          slackUserId: contactId
        });

        if (!contact) continue;

        // Get last interaction
        const lastInteraction = await inMemoryStore.findInteractions({
          userId,
          contactId
        }).then(interactions => 
          interactions.sort((a, b) => new Date(b.messageTimestamp) - new Date(a.messageTimestamp))[0]
        );

        // Get shared channels and interests
        const sharedChannels = await getSharedChannels(userId, contactId);
        const currentUser = await inMemoryStore.findUser({ slackUserId: userId });
        const sharedInterests = getSharedInterests(currentUser, contact);

        const relationship = await inMemoryStore.createRelationship({
          userId,
          teamId,
          contactId,
          relationshipType: 'colleague',
          addedVia: 'recent_dms',
          lastInteraction: lastInteraction?.messageTimestamp,
          interactionCount: await inMemoryStore.countInteractions({ userId, contactId }),
          sharedChannels,
          sharedInterests
        });

        addedRelationships.push(relationship);
      } catch (error) {
        errors.push({ contactId, error: error.message });
      }
    }

    res.json({
      added: addedRelationships.length,
      relationships: addedRelationships,
      errors
    });
  } catch (error) {
    console.error('Add recent DMs error:', error);
    res.status(500).json({ error: 'Failed to add recent DM contacts' });
  }
});

// Update relationship
router.put('/:relationshipId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { relationshipId } = req.params;
    const updates = req.body;

    const relationship = await inMemoryStore.findRelationship({
      userId,
      contactId: relationshipId
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    // Update allowed fields
    const updateData = {};
    if (updates.relationshipType) updateData.relationshipType = updates.relationshipType;
    if (updates.customRelationshipType) updateData.customRelationshipType = updates.customRelationshipType;
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.tags) updateData.tags = updates.tags;
    
    const updatedRelationship = await inMemoryStore.updateRelationship({
      userId,
      contactId: relationshipId
    }, updateData);

    res.json(updatedRelationship);
  } catch (error) {
    console.error('Update relationship error:', error);
    res.status(500).json({ error: 'Failed to update relationship' });
  }
});

// Delete relationship
router.delete('/:relationshipId', async (req, res) => {
  try {
    const { userId } = req.user;
    const { relationshipId } = req.params;

    const relationship = await inMemoryStore.findRelationship({
      userId,
      contactId: relationshipId
    });

    if (!relationship) {
      return res.status(404).json({ error: 'Relationship not found' });
    }

    await inMemoryStore.updateRelationship({
      userId,
      contactId: relationshipId
    }, { isActive: false });

    res.json({ message: 'Relationship deleted successfully' });
  } catch (error) {
    console.error('Delete relationship error:', error);
    res.status(500).json({ error: 'Failed to delete relationship' });
  }
});

// Get contact profile
router.get('/contact/:contactId', async (req, res) => {
  try {
    const { userId, teamId } = req.user;
    const { contactId } = req.params;

    const contact = await inMemoryStore.findUser({
      slackUserId: contactId
    });

    if (!contact) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    const relationship = await inMemoryStore.findRelationship({
      userId,
      contactId
    });

    const lastInteraction = await inMemoryStore.findInteractions({
      userId,
      contactId
    }).then(interactions => 
      interactions.sort((a, b) => new Date(b.messageTimestamp) - new Date(a.messageTimestamp))[0]
    );

    const interactionCount = await inMemoryStore.countInteractions({
      userId,
      contactId
    });

    res.json({
      contact: {
        slackUserId: contact.slackUserId,
        displayName: contact.displayName,
        realName: contact.realName,
        email: contact.email,
        profile: contact.profile,
        avatar: contact.avatar,
        isAdmin: contact.isAdmin,
        isOwner: contact.isOwner
      },
      relationship: relationship ? {
        relationshipType: relationship.relationshipType,
        customRelationshipType: relationship.customRelationshipType,
        notes: relationship.notes,
        tags: relationship.tags,
        addedVia: relationship.addedVia,
        addedAt: relationship.metadata.addedAt
      } : null,
      lastInteraction: lastInteraction?.messageTimestamp,
      interactionCount,
      sharedChannels: relationship?.sharedChannels || [],
      sharedInterests: relationship?.sharedInterests || []
    });
  } catch (error) {
    console.error('Get contact profile error:', error);
    res.status(500).json({ error: 'Failed to get contact profile' });
  }
});

// Helper functions
async function getSharedChannels(userId, contactId) {
  try {
    // This would require Slack API calls to get shared channels
    // For now, return empty array - implement based on available Slack API scopes
    return [];
  } catch (error) {
    console.error('Get shared channels error:', error);
    return [];
  }
}

async function getChannelMembers(channelId, userId) {
  try {
    // This would require Slack API calls to get channel members
    // For now, return empty array - implement based on available Slack API scopes
    return [];
  } catch (error) {
    console.error('Get channel members error:', error);
    return [];
  }
}

function getSharedInterests(user1, user2) {
  if (!user1?.profile?.interests || !user2?.profile?.interests) {
    return [];
  }

  const interests1 = user1.profile.interests.map(i => i.toLowerCase());
  const interests2 = user2.profile.interests.map(i => i.toLowerCase());

  return interests1.filter(interest => interests2.includes(interest));
}

module.exports = router; 