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
              <div className="text-brown-600">Loading...</div>
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