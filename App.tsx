import React, { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { AuthForm } from './components/AuthForm';
import { MainApp } from './components/MainApp';

// This component is shown to the user if no API key has been selected yet.
const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => {
  const handleSelectKey = async () => {
    // The `window.aistudio` object is provided by the execution environment.
    if (window.aistudio) {
      // This function opens the platform's dialog for API key selection.
      await window.aistudio.openSelectKey();
      // Due to a potential race condition in the platform, we assume the key
      // selection was successful and immediately update the app's state.
      onKeySelected();
    } else {
      // Fallback for environments where the aistudio object isn't available.
      alert("API Key selection is not available in this environment.");
    }
  };

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
        <h1 className="text-3xl sm:text-4xl font-bold text-brown-800 text-center">Welcome to DocuMind</h1>
        <p className="text-brown-300 text-center mt-2 mb-8">To get started, please select a Gemini API key. Your key is used to power the app's intelligent features.</p>
        <div className="space-y-4">
            <button
              onClick={handleSelectKey}
              className="w-full bg-brown-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-brown-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brown-600 transition-transform transform hover:scale-105"
            >
              Select API Key
            </button>
            <p className="text-center text-xs text-brown-300 pt-2">
              For more information on billing, please visit the{' '}
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="font-semibold text-brown-600 hover:underline">
                Gemini API billing documentation
              </a>.
            </p>
        </div>
      </div>
    </div>
  );
};


function App() {
  const { currentUser, isLoading, login, signup, logout, addDocument, deleteDocument, updateDocument, addFormAnalysis, deleteFormAnalysis } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [isApiKeySelected, setIsApiKeySelected] = useState(false);
  const [isCheckingApiKey, setIsCheckingApiKey] = useState(true);
  
  // On initial load, check if an API key has already been selected.
  useEffect(() => {
    const checkKey = async () => {
      // The `window.aistudio` object may not be available immediately.
      if (window.aistudio) {
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setIsApiKeySelected(hasKey);
      }
      setIsCheckingApiKey(false);
    };
    // Use a timeout to ensure the `aistudio` object is available.
    setTimeout(checkKey, 0);
  }, []);

  // This function is called by the ApiKeySelector after the user interacts with the dialog.
  const handleKeySelected = () => {
    setIsApiKeySelected(true);
  };
  
  // This function is passed down to MainApp to be called if an API call fails due to an invalid key.
  const handleApiKeyInvalid = () => {
    setIsApiKeySelected(false);
  };

  if (isLoading || isCheckingApiKey) {
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

  // If no API key is selected, render the selection component.
  if (!isApiKeySelected) {
    return <ApiKeySelector onKeySelected={handleKeySelected} />;
  }

  // Once an API key is selected, proceed to the normal authentication flow.
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
            onApiKeyInvalid={handleApiKeyInvalid}
         />;
}

export default App;
