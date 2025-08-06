import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    slackUserId: 'U1234567890',
    slackTeamId: 'T1234567890',
    email: 'john.doe@company.com',
    displayName: 'John Doe',
    realName: 'John Doe',
    profile: {
      title: 'Senior Software Engineer',
      department: 'Engineering',
      interests: ['coding', 'hiking', 'photography', 'machine learning'],
      status: 'Available',
      statusEmoji: ':white_check_mark:',
      phone: '+1 (555) 123-4567',
      skype: 'john.doe'
    },
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    isAdmin: false,
    isOwner: false
  });
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState('demo-token');

  // Auto-login with demo user
  useEffect(() => {
    const autoLogin = async () => {
      try {
        const response = await axios.post('/api/demo/login');
        const { token: newToken } = response.data;
        
        setToken(newToken);
        localStorage.setItem('token', newToken);
        axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      } catch (error) {
        console.error('Auto demo login failed:', error);
      } finally {
        setLoading(false);
      }
    };
    
    autoLogin();
  }, []);

  const value = {
    user,
    loading,
    token,
    isAuthenticated: true,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 