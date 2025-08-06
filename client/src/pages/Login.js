import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Slack, Users, Map, Zap, Play } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const { login, demoLogin } = useAuth();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      // Handle successful OAuth callback
      localStorage.setItem('token', token);
      window.location.href = '/dashboard';
    }
  }, [searchParams]);

  const handleSlackLogin = () => {
    const clientId = process.env.REACT_APP_SLACK_CLIENT_ID || 'your-client-id';
    const redirectUri = encodeURIComponent(
      process.env.REACT_APP_SLACK_REDIRECT_URI || 'http://localhost:3000/auth-success'
    );
    const scope = encodeURIComponent('users:read,channels:read,groups:read,im:read,mpim:read');
    
    const slackAuthUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=${scope}&redirect_uri=${redirectUri}`;
    
    window.location.href = slackAuthUrl;
  };

  const handleDemoLogin = async () => {
    try {
      await demoLogin();
      toast.success('Demo login successful!');
    } catch (error) {
      toast.error('Demo login failed. Please try again.');
    }
  };

  const features = [
    {
      icon: Users,
      title: 'Build Your Network',
      description: 'Add colleagues, team members, and professional contacts to your relationship map.'
    },
    {
      icon: Map,
      title: 'Visualize Connections',
      description: 'See your professional relationships in an interactive network visualization.'
    },
    {
      icon: Zap,
      title: 'Smart Insights',
      description: 'Get insights about shared interests, recent interactions, and team dynamics.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slack-purple via-purple-700 to-indigo-800 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <Slack className="h-16 w-16 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">
            Relationship Mapping
          </h2>
          <p className="mt-2 text-sm text-gray-200">
            Visualize and manage your professional relationships in Slack
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Sign in with Slack
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect your Slack workspace to start building your relationship map.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSlackLogin}
                className="w-full flex justify-center items-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-slack-purple hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
              >
                <Slack className="h-5 w-5 mr-2" />
                Continue with Slack
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or</span>
                </div>
              </div>

              <button
                onClick={handleDemoLogin}
                className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
              >
                <Play className="h-5 w-5 mr-2" />
                Try Demo Version
              </button>
            </div>

            <div className="text-xs text-gray-500 text-center">
              <p className="mb-2">By signing in, you agree to our terms of service and privacy policy.</p>
              <p className="text-yellow-600 bg-yellow-50 p-2 rounded">
                <strong>Demo Mode:</strong> Experience the app with sample data. No real Slack integration required.
              </p>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="text-center">
              <div className="flex justify-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-full bg-white bg-opacity-20">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm text-gray-200">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-300">
            Built with ❤️ for better professional relationships
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login; 