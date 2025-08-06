import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Plus, 
  MessageCircle, 
  TrendingUp,
  Search,
  X,
  Check,
  Loader
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Dashboard = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [activeTab, setActiveTab] = useState('search');
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const { data: relationships, isLoading } = useQuery(
    'relationships',
    async () => {
      const response = await axios.get('/api/relationships/map');
      return response.data;
    },
    {
      refetchOnWindowFocus: false,
    }
  );

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
  const { data: recentDMs } = useQuery(
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

  const stats = [
    {
      name: 'Total Relationships',
      value: relationships?.length || 0,
      icon: Users,
      color: 'bg-blue-500',
      href: '/map'
    },
    {
      name: 'Recent Interactions',
      value: relationships?.filter(r => r.lastInteraction && new Date(r.lastInteraction) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length || 0,
      icon: MessageCircle,
      color: 'bg-green-500',
      href: '/map'
    },
    {
      name: 'Team Members',
      value: relationships?.filter(r => r.relationshipType === 'team_member').length || 0,
      icon: Users,
      color: 'bg-purple-500',
      href: '/map'
    },
    {
      name: 'Direct Reports',
      value: relationships?.filter(r => r.relationshipType === 'direct_report').length || 0,
      icon: TrendingUp,
      color: 'bg-orange-500',
      href: '/map'
    }
  ];





  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center">
          <img
            className="h-16 w-16 rounded-full"
            src={user?.avatar || 'https://via.placeholder.com/64'}
            alt={user?.displayName}
          />
          <div className="ml-4">
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.displayName}!
            </h1>
            <p className="text-gray-600">
              Manage your professional relationships and network insights
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.name}
            to={stat.href}
            className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 ${stat.color} rounded-md p-3`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Add Relationships Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Add Relationships</h2>
          <p className="text-sm text-gray-600">Build your professional network by adding contacts from Slack</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-[#1264A3] text-[#1D1C1D]'
                    : 'border-transparent text-[#453337] hover:text-[#1D1C1D]'
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
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Enter tags separated by commas..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={addRelationshipMutation.isLoading}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="team_member">Team Member</option>
                    <option value="colleague">Colleague</option>
                    <option value="direct_report">Direct Report</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addTeamMutation.isLoading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  >
                    <option value="7">Last 7 days</option>
                    <option value="30">Last 30 days</option>
                    <option value="90">Last 90 days</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={addDMsMutation.isLoading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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



      {/* All Relationships */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">All Relationships</h2>
              <p className="text-sm text-gray-600">Your complete professional network ({relationships?.length || 0} contacts)</p>
            </div>
            <Link
              to="/map"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View network map
            </Link>
          </div>
        </div>
        <div className="p-6">
          {relationships && relationships.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {relationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="relative bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer"
                >
                  {/* Profile Image & Status */}
                  <div className="relative mb-3">
                    <img
                      className="w-16 h-16 rounded-lg object-cover mx-auto"
                      src={relationship.contactId?.avatar || 'https://via.placeholder.com/64'}
                      alt={relationship.contactId?.displayName}
                    />
                    {/* Online Status Indicator */}
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-2 border-white rounded-full"></div>
                  </div>
                  
                  {/* Name & Title */}
                  <div className="text-center mb-3">
                    <h3 className="text-sm font-semibold text-gray-900 truncate">
                      {relationship.contactId?.displayName}
                    </h3>
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {relationship.contactId?.profile?.title || 'No title'}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {relationship.contactId?.profile?.department || ''}
                    </p>
                  </div>

                  {/* Relationship Type Badge */}
                  <div className="flex justify-center mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      relationship.relationshipType === 'manager' ? 'bg-purple-100 text-purple-800' :
                      relationship.relationshipType === 'direct_report' ? 'bg-blue-100 text-blue-800' :
                      relationship.relationshipType === 'team_member' ? 'bg-green-100 text-green-800' :
                      relationship.relationshipType === 'colleague' ? 'bg-gray-100 text-gray-800' :
                      relationship.relationshipType === 'mentor' ? 'bg-yellow-100 text-yellow-800' :
                      relationship.relationshipType === 'mentee' ? 'bg-orange-100 text-orange-800' :
                      'bg-indigo-100 text-indigo-800'
                    }`}>
                      {relationship.relationshipType.replace('_', ' ')}
                    </span>
                  </div>

                  {/* Last Interaction */}
                  <div className="text-center">
                    <p className="text-xs text-gray-500">
                      Last interaction:{' '}
                      {relationship.lastInteraction 
                        ? (() => {
                            const date = new Date(relationship.lastInteraction);
                            const now = new Date();
                            const diffTime = Math.abs(now - date);
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                            
                            if (diffDays === 1) return 'Yesterday';
                            if (diffDays < 7) return `${diffDays} days ago`;
                            if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
                            return date.toLocaleDateString();
                          })()
                        : 'No recent activity'
                      }
                    </p>
                  </div>

                  {/* Tags */}
                  {relationship.tags && relationship.tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap justify-center gap-1">
                      {relationship.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600"
                        >
                          {tag}
                        </span>
                      ))}
                      {relationship.tags.length > 2 && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600">
                          +{relationship.tags.length - 2}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No relationships yet</h3>
              <p className="mt-2 text-sm text-gray-500">
                Start building your network by adding your first contact using the tools above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 