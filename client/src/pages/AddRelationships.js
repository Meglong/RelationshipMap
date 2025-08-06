import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { 
  Search, 
  Users, 
  MessageCircle, 
  UserPlus, 
  Plus,
  X,
  Check,
  Loader
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const AddRelationships = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Search users query
  const { data: searchResults, isLoading: isSearching } = useQuery(
    ['search-users', searchQuery],
    async () => {
      if (!searchQuery || searchQuery.length < 2) return [];
      const response = await axios.get(`/api/slack/users/search?query=${encodeURIComponent(searchQuery)}`);
      return response.data;
    },
    {
      enabled: searchQuery.length >= 2,
      refetchOnWindowFocus: false,
    }
  );

  // Get channels query
  const { data: channels, isLoading: isChannelsLoading } = useQuery(
    'channels',
    async () => {
      const response = await axios.get('/api/slack/channels');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Get recent DMs query
  const { data: recentDMs, isLoading: isDMsLoading } = useQuery(
    'recent-dms',
    async () => {
      const response = await axios.get('/api/slack/recent-dms?days=30');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

  // Add individual relationship mutation
  const addRelationshipMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/relationships/add', data);
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Relationship added successfully!');
        queryClient.invalidateQueries('relationships');
        reset();
        setSelectedUsers([]);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add relationship');
      },
    }
  );

  // Add team members mutation
  const addTeamMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/relationships/add-team', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Added ${data.added} team members!`);
        queryClient.invalidateQueries('relationships');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add team members');
      },
    }
  );

  // Add recent DMs mutation
  const addDMsMutation = useMutation(
    async (data) => {
      const response = await axios.post('/api/relationships/add-recent-dms', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Added ${data.added} contacts from recent DMs!`);
        queryClient.invalidateQueries('relationships');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to add recent DM contacts');
      },
    }
  );

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleUserSelect = (user) => {
    if (!selectedUsers.find(u => u.slackUserId === user.slackUserId)) {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleUserRemove = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u.slackUserId !== userId));
  };

  const handleAddIndividual = (data) => {
    selectedUsers.forEach(user => {
      addRelationshipMutation.mutate({
        contactId: user.slackUserId,
        relationshipType: data.relationshipType,
        customRelationshipType: data.relationshipType === 'custom' ? data.customRelationshipType : undefined,
        notes: data.notes,
        tags: data.tags ? data.tags.split(',').map(tag => tag.trim()) : []
      });
    });
  };

  const handleAddTeam = (data) => {
    addTeamMutation.mutate({
      channelId: data.channelId,
      relationshipType: data.relationshipType
    });
  };

  const handleAddRecentDMs = (data) => {
    addDMsMutation.mutate({
      days: parseInt(data.days)
    });
  };

  const tabs = [
    { id: 'search', name: 'Search & Add', icon: Search },
    { id: 'team', name: 'Import Team', icon: Users },
    { id: 'dms', name: 'Recent DMs', icon: MessageCircle }
  ];

  const relationshipTypes = [
    { value: 'colleague', label: 'Colleague' },
    { value: 'team_member', label: 'Team Member' },
    { value: 'direct_report', label: 'Direct Report' },
    { value: 'manager', label: 'Manager' },
    { value: 'mentor', label: 'Mentor' },
    { value: 'mentee', label: 'Mentee' },
    { value: 'friend', label: 'Friend' },
    { value: 'custom', label: 'Custom' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900">Add Relationships</h1>
        <p className="text-gray-600">
          Build your professional network by adding contacts from Slack
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Search & Add Tab */}
          {activeTab === 'search' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Users
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name, email, or title..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Search Results */}
              {searchQuery.length >= 2 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Search Results</h3>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner />
                    </div>
                  ) : searchResults?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {searchResults.map((user) => (
                        <div
                          key={user.slackUserId}
                          className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleUserSelect(user)}
                        >
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar || 'https://via.placeholder.com/32'}
                            alt={user.displayName}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {user.profile?.title}
                            </p>
                          </div>
                          {selectedUsers.find(u => u.slackUserId === user.slackUserId) && (
                            <Check className="h-4 w-4 text-green-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center py-4">No users found</p>
                  )}
                </div>
              )}

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Users</h3>
                  <div className="space-y-2">
                    {selectedUsers.map((user) => (
                      <div
                        key={user.slackUserId}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            className="h-8 w-8 rounded-full"
                            src={user.avatar || 'https://via.placeholder.com/32'}
                            alt={user.displayName}
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {user.profile?.title}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleUserRemove(user.slackUserId)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Form */}
              {selectedUsers.length > 0 && (
                <form onSubmit={handleSubmit(handleAddIndividual)} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Relationship Type
                    </label>
                    <select
                      {...register('relationshipType', { required: 'Relationship type is required' })}
                      className="input-field"
                    >
                      {relationshipTypes.map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                    {errors.relationshipType && (
                      <p className="text-red-500 text-sm mt-1">{errors.relationshipType.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes (optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="input-field"
                      placeholder="Add any notes about this relationship..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tags (optional)
                    </label>
                    <input
                      type="text"
                      {...register('tags')}
                      className="input-field"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addRelationshipMutation.isLoading}
                    className="btn-primary w-full"
                  >
                    {addRelationshipMutation.isLoading ? (
                      <Loader className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4 mr-2" />
                    )}
                    Add {selectedUsers.length} Relationship{selectedUsers.length !== 1 ? 's' : ''}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Import Team Tab */}
          {activeTab === 'team' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Import Team Members</h3>
                <p className="text-gray-600 mb-6">
                  Add all members from a Slack channel to your relationship map.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleAddTeam)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Channel
                  </label>
                  {isChannelsLoading ? (
                    <LoadingSpinner />
                  ) : (
                    <select
                      {...register('channelId', { required: 'Channel is required' })}
                      className="input-field"
                    >
                      <option value="">Choose a channel...</option>
                      {channels?.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          #{channel.name}
                        </option>
                      ))}
                    </select>
                  )}
                  {errors.channelId && (
                    <p className="text-red-500 text-sm mt-1">{errors.channelId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship Type
                  </label>
                  <select
                    {...register('relationshipType', { required: 'Relationship type is required' })}
                    className="input-field"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="colleague">Colleague</option>
                    <option value="direct_report">Direct Report</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addTeamMutation.isLoading}
                  className="btn-primary w-full"
                >
                  {addTeamMutation.isLoading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  Import Team Members
                </button>
              </form>
            </div>
          )}

          {/* Recent DMs Tab */}
          {activeTab === 'dms' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Recent DM Contacts</h3>
                <p className="text-gray-600 mb-6">
                  Import contacts from your recent direct message conversations.
                </p>
              </div>

              <form onSubmit={handleSubmit(handleAddRecentDMs)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time Period
                  </label>
                  <select
                    {...register('days', { required: 'Time period is required' })}
                    className="input-field"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30" selected>Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addDMsMutation.isLoading}
                  className="btn-primary w-full"
                >
                  {addDMsMutation.isLoading ? (
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  )}
                  Add Recent DM Contacts
                </button>
              </form>

              {/* Recent DMs Preview */}
              {recentDMs && recentDMs.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Recent DM Contacts</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {recentDMs.slice(0, 6).map((user) => (
                      <div
                        key={user.slackUserId}
                        className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg"
                      >
                        <img
                          className="h-8 w-8 rounded-full"
                          src={user.avatar || 'https://via.placeholder.com/32'}
                          alt={user.displayName}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {user.profile?.title}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  {recentDMs.length > 6 && (
                    <p className="text-sm text-gray-500 text-center mt-3">
                      And {recentDMs.length - 6} more contacts...
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddRelationships; 