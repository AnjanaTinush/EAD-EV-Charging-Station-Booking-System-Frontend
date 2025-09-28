import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { trackLogin } from '../utils/loginTracker';

export default function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await authAPI.login(formData.email, formData.password);
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));

      // Track successful login
      trackLogin('Success', result.user.username);

      navigate('/dashboard');
    } catch (err) {
      // Track failed login attempt
      trackLogin('Failed', formData.email);

      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ev-primary-50 via-ev-secondary-50 to-ev-primary-100">
      <div className="max-w-md w-full space-y-8 px-4">
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-ev-gradient rounded-3xl flex items-center justify-center mb-6 charging-animation shadow-ev-glow">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z"/>
            </svg>
          </div>
          <h1 className="text-5xl font-bold ev-gradient-text mb-3">
            EV Charging Hub
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            Power up your journey with smart charging
          </p>
        </div>
        
        <form className="mt-8 ev-form" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border-2 border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center space-x-3">
              <svg className="w-5 h-5 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">{error}</span>
            </div>
          )}

          <div className="space-y-6">
            <div className="ev-form-group">
              <label htmlFor="email" className="ev-label flex items-center space-x-2">
                <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                <span>Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="ev-input w-full text-gray-900 placeholder-gray-500"
                placeholder="Enter your email address"
              />
            </div>

            <div className="ev-form-group">
              <label htmlFor="password" className="ev-label flex items-center space-x-2">
                <svg className="w-4 h-4 text-ev-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span>Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="ev-input w-full text-gray-900 placeholder-gray-500"
                placeholder="Enter your password"
              />
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="btn-ev-primary w-full flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <>
                  <svg className="ev-spinner" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Connecting to Network...</span>
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  <span>Power Up & Sign In</span>
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <p className="text-sm text-gray-600">
              New to EV Charging Hub?{' '}
              <Link to="/register" className="font-semibold text-ev-primary-600 hover:text-ev-primary-700 transition-colors">
                Join the Network
              </Link>
            </p>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-ev-primary-200 rounded-full opacity-20 animate-pulse-slow"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-ev-secondary-200 rounded-full opacity-20 animate-pulse-slow" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 right-5 w-12 h-12 bg-ev-accent-200 rounded-full opacity-20 animate-pulse-slow" style={{animationDelay: '2s'}}></div>
      </div>
    </div>
  );
}