import React, { useState } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { MainApp } from './components/MainApp';

function App() {
  const { currentUser, isLoading, login, signup, logout, addDocument, deleteDocument, updateDocument, addFormAnalysis, deleteFormAnalysis } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-beige-100">
        <div className="flex flex-col items-center">
          <div className="flex items-center space-x-2">
            <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse [animation-delay:-0.3s]"></span>
            <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse [animation-delay:-0.15s]"></span>
            <span className="h-3 w-3 bg-brown-600 rounded-full animate-pulse"></span>
          </div>
          <p className="text-brown-600 mt-4">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthForm
        formType={isLoginView ? 'login' : 'signup'}
        onSubmit={isLoginView ? login : signup}
        switchForm={() => setIsLoginView(!isLoginView)}
      />
    );
  }

  return <MainApp
    user={currentUser}
    onLogout={logout}
    onAddDocument={addDocument}
    onDeleteDocument={deleteDocument}
    onUpdateDocument={updateDocument}
    onAddFormAnalysis={addFormAnalysis}
    onDeleteFormAnalysis={deleteFormAnalysis}
  />;
}

export default App;
