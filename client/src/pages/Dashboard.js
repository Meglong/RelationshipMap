import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, 
  Map, 
  Plus, 
  MessageCircle, 
  TrendingUp, 
  Calendar,
  ArrowRight,
  UserPlus,
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
      icon: UserPlus,
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

  const quickActions = [
    {
      name: 'Add Individual Contact',
      description: 'Search and add a specific person to your network',
      icon: UserPlus,
      href: '/add',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      name: 'Import Team Members',
      description: 'Add all members from a Slack channel',
      icon: Users,
      href: '/add',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      name: 'Add Recent DMs',
      description: 'Import contacts from recent direct messages',
      icon: MessageCircle,
      href: '/add',
      color: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      name: 'View Relationship Map',
      description: 'Explore your network visualization',
      icon: Map,
      href: '/map',
      color: 'bg-orange-500 hover:bg-orange-600'
    }
  ];

  const recentRelationships = relationships?.slice(0, 5) || [];

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
          <p className="text-sm text-gray-600">Search and add people to your professional network</p>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {/* Search Input */}
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
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <p className="text-sm text-gray-600">Get started with these common tasks</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {quickActions.map((action) => (
              <Link
                key={action.name}
                to={action.href}
                className="relative group bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${action.color} rounded-md p-2`}>
                    <action.icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-sm font-medium text-gray-900 group-hover:text-gray-700">
                      {action.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Relationships */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Recent Relationships</h2>
              <p className="text-sm text-gray-600">Your most recently added contacts</p>
            </div>
            <Link
              to="/map"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all
            </Link>
          </div>
        </div>
        <div className="p-6">
          {recentRelationships.length > 0 ? (
            <div className="space-y-4">
              {recentRelationships.map((relationship) => (
                <div
                  key={relationship.id}
                  className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  <img
                    className="h-10 w-10 rounded-full"
                    src={relationship.contact?.avatar || 'https://via.placeholder.com/40'}
                    alt={relationship.contact?.displayName}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {relationship.contact?.displayName}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {relationship.contact?.profile?.title}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium relationship-${relationship.relationshipType}`}>
                      {relationship.relationshipType.replace('_', ' ')}
                    </span>
                    {relationship.lastInteraction && (
                      <span className="text-xs text-gray-400">
                        {new Date(relationship.lastInteraction).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No relationships yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Start building your network by adding some contacts.
              </p>
              <div className="mt-6">
                <Link
                  to="/add"
                  className="btn-primary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Contact
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 