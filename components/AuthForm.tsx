import React, { useState } from 'react';

interface AuthFormProps {
  formType: 'login' | 'signup';
  onSubmit: (username: string, password: string) => boolean;
  switchForm: () => void;
}

const titles = {
  login: {
    title: "Welcome Back",
    subtitle: "Log in to access your document assistant.",
    buttonText: "Log In",
    switchText: "Don't have an an account?",
    switchLink: "Sign Up"
  },
  signup: {
    title: "Create Account",
    subtitle: "Sign up to start organizing your documents.",
    buttonText: "Sign Up",
    switchText: "Already have an account?",
    switchLink: "Log In"
  }
};

export const AuthForm: React.FC<AuthFormProps> = ({ formType, onSubmit, switchForm }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (password.length < 6) {
        setError('Password must be at least 6 characters long.');
        return;
    }
    const success = onSubmit(username.trim(), password);
    if (!success) {
      setError(formType === 'login' ? 'Invalid username or password.' : 'Username already taken.');
    } else {
      setError('');
    }
  };

  const content = titles[formType];

  return (
    <div className="min-h-screen flex items-center justify-center bg-beige-100 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 transition-all duration-500 animate-fade-in">
        <style>{`
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `}</style>
        <h1 className="text-3xl sm:text-4xl font-bold text-brown-800 text-center">{content.title}</h1>
        <p className="text-brown-300 text-center mt-2 mb-8">{content.subtitle}</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="text-sm font-medium text-brown-600">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError('');
              }}
              className="mt-1 block w-full px-4 py-3 bg-beige-50 border border-beige-300 rounded-lg text-brown-800 focus:ring-brown-600 focus:border-brown-600 transition"
              placeholder="e.g., jane_doe"
            />
          </div>
          <div>
            <label htmlFor="password"  className="text-sm font-medium text-brown-600">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError('');
              }}
              className="mt-1 block w-full px-4 py-3 bg-beige-50 border border-beige-300 rounded-lg text-brown-800 focus:ring-brown-600 focus:border-brown-600 transition"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center pt-2">{error}</p>}
          <button
            type="submit"
            className="w-full bg-brown-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition-transform transform hover:scale-105"
          >
            {content.buttonText}
          </button>
        </form>
        <p className="text-center text-sm text-brown-300 mt-8">
          {content.switchText}{' '}
          <button onClick={switchForm} className="font-semibold text-brown-600 hover:underline">
            {content.switchLink}
          </button>
        </p>
      </div>
    </div>
  );
};