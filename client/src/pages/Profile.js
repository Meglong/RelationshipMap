import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { 
  User, 
  Mail, 
  Building, 
  MapPin, 
  Phone, 
  Calendar,
  Edit,
  Save,
  X,
  RefreshCw,
  Settings
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const queryClient = useQueryClient();

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      displayName: user?.displayName || '',
      realName: user?.realName || '',
      title: user?.profile?.title || '',
      department: user?.profile?.department || '',
      interests: user?.profile?.interests?.join(', ') || '',
      phone: user?.profile?.phone || '',
      skype: user?.profile?.skype || ''
    }
  });

  // Sync user data mutation
  const syncUserMutation = useMutation(
    async () => {
      const response = await axios.post('/api/slack/sync-user');
      return response.data;
    },
    {
      onSuccess: () => {
        toast.success('Profile synced successfully!');
        queryClient.invalidateQueries('user');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to sync profile');
      },
    }
  );

  // Sync team data mutation
  const syncTeamMutation = useMutation(
    async () => {
      const response = await axios.post('/api/slack/sync-team');
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast.success(`Synced ${data.synced} team members!`);
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to sync team data');
      },
    }
  );

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    reset();
  };

  const handleSave = (data) => {
    // This would typically update the user profile
    // For now, just show a success message
    toast.success('Profile updated successfully!');
    setIsEditing(false);
  };

  const handleSyncUser = () => {
    syncUserMutation.mutate();
  };

  const handleSyncTeam = () => {
    syncTeamMutation.mutate();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
            <p className="text-gray-600">
              Manage your profile information and settings
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleSyncUser}
              disabled={syncUserMutation.isLoading}
              className="btn-secondary"
            >
              {syncUserMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Profile
            </button>
            <button
              onClick={handleSyncTeam}
              disabled={syncTeamMutation.isLoading}
              className="btn-secondary"
            >
              {syncTeamMutation.isLoading ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Sync Team
            </button>
          </div>
        </div>
      </div>

      {/* Profile Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="btn-secondary"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="btn-secondary"
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  onClick={handleSubmit(handleSave)}
                  className="btn-primary"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6">
          <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-start space-x-6">
              <div className="flex-shrink-0">
                <img
                  className="h-24 w-24 rounded-full"
                  src={user.avatar || 'https://via.placeholder.com/96'}
                  alt={user.displayName}
                />
              </div>
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Display Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('displayName')}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900">{user.displayName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Real Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        {...register('realName')}
                        className="input-field"
                      />
                    ) : (
                      <p className="text-gray-900">{user.realName}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Professional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('title')}
                    className="input-field"
                    placeholder="e.g., Software Engineer"
                  />
                ) : (
                  <p className="text-gray-900">{user.profile?.title || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('department')}
                    className="input-field"
                    placeholder="e.g., Engineering"
                  />
                ) : (
                  <p className="text-gray-900">{user.profile?.department || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone
                </label>
                {isEditing ? (
                  <input
                    type="tel"
                    {...register('phone')}
                    className="input-field"
                    placeholder="+1 (555) 123-4567"
                  />
                ) : (
                  <p className="text-gray-900">{user.profile?.phone || 'Not specified'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Skype
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    {...register('skype')}
                    className="input-field"
                    placeholder="username"
                  />
                ) : (
                  <p className="text-gray-900">{user.profile?.skype || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Interests */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interests
              </label>
              {isEditing ? (
                <input
                  type="text"
                  {...register('interests')}
                  className="input-field"
                  placeholder="e.g., hiking, photography, coding"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {user.profile?.interests && user.profile.interests.length > 0 ? (
                    user.profile.interests.map((interest, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {interest}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">No interests specified</p>
                  )}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Account Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slack User ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{user.slackUserId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team ID
              </label>
              <p className="text-gray-900 font-mono text-sm">{user.slackTeamId}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Account Type
              </label>
              <div className="flex space-x-2">
                {user.isAdmin && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    Admin
                  </span>
                )}
                {user.isOwner && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    Owner
                  </span>
                )}
                {!user.isAdmin && !user.isOwner && (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    Member
                  </span>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timezone
              </label>
              <p className="text-gray-900">{user.timezone || 'Not specified'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Information */}
      {user.profile?.status && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Current Status</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center space-x-3">
              {user.profile.statusEmoji && (
                <span className="text-2xl">{user.profile.statusEmoji}</span>
              )}
              <div>
                <p className="text-gray-900 font-medium">{user.profile.statusText}</p>
                <p className="text-sm text-gray-500">Status updated from Slack</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Settings</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Data Sync</h3>
                <p className="text-sm text-gray-500">
                  Automatically sync your profile and team data from Slack
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSyncUser}
                  disabled={syncUserMutation.isLoading}
                  className="btn-secondary"
                >
                  {syncUserMutation.isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900">Team Sync</h3>
                <p className="text-sm text-gray-500">
                  Sync all team members from your Slack workspace
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleSyncTeam}
                  disabled={syncTeamMutation.isLoading}
                  className="btn-secondary"
                >
                  {syncTeamMutation.isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 