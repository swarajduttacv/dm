import { useState, useEffect, useCallback } from 'react';
import type { User, Document, FormAnalysis } from '../types';

const DB_KEY = 'docuMindUsersDB';
const SESSION_KEY = 'docuMindSessionKey';

interface UserInDB {
    password: string;
    documents: Document[];
    formAnalyses: FormAnalysis[];
}

const getInitialDB = (): Record<string, UserInDB> => {
  try {
    const db = localStorage.getItem(DB_KEY);
    return db ? JSON.parse(db) : {};
  } catch (error) {
    console.error("Failed to parse user DB from localStorage", error);
    return {};
  }
};

export const useAuth = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [usersDB, setUsersDB] = useState<Record<string, UserInDB>>(getInitialDB);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(usersDB));
    } catch (error) {
      console.error("Failed to save user DB to localStorage", error);
    }
  }, [usersDB]);

  useEffect(() => {
    try {
      const sessionUser = localStorage.getItem(SESSION_KEY);
      if (sessionUser && usersDB[sessionUser]) {
        setCurrentUser({ username: sessionUser, ...usersDB[sessionUser] });
      }
    } catch (error) {
      console.error("Failed to get session user from localStorage", error);
    } finally {
      setIsLoading(false);
    }
  }, []); // Run only on initial mount


  const signup = (username: string, password: string):boolean => {
    if (usersDB[username]) {
      return false; // User already exists
    }
    setUsersDB(prev => ({
      ...prev,
      [username]: { password, documents: [], formAnalyses: [] }
    }));
    return true;
  };

  const login = (username: string, password: string):boolean => {
    if (usersDB[username] && usersDB[username].password === password) {
      setCurrentUser({ username, ...usersDB[username] });
      localStorage.setItem(SESSION_KEY, username);
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(SESSION_KEY);
  };

  const addDocument = useCallback((document: Document) => {
    if (currentUser) {
      const updatedUser = {
        ...currentUser,
        documents: [...currentUser.documents, document],
      };
      setCurrentUser(updatedUser);
      setUsersDB(prev => ({
        ...prev,
        [currentUser.username]: {
            ...prev[currentUser.username],
            documents: updatedUser.documents
        },
      }));
    }
  }, [currentUser]);

  const updateDocument = useCallback((documentId: string, newText: string) => {
    if (currentUser) {
        const updatedDocuments = currentUser.documents.map(doc =>
            doc.id === documentId ? { ...doc, extractedText: newText } : doc
        );
        const updatedUser = {
            ...currentUser,
            documents: updatedDocuments,
        };
        setCurrentUser(updatedUser);
        setUsersDB(prev => ({
            ...prev,
            [currentUser.username]: {
                ...prev[currentUser.username],
                documents: updatedUser.documents
            },
        }));
    }
  }, [currentUser]);

  const deleteDocument = useCallback((documentId: string) => {
    if (currentUser) {
        const updatedDocuments = currentUser.documents.filter(doc => doc.id !== documentId);
        const updatedUser = {
            ...currentUser,
            documents: updatedDocuments,
        };
        setCurrentUser(updatedUser);
        setUsersDB(prev => ({
            ...prev,
            [currentUser.username]: {
                ...prev[currentUser.username],
                documents: updatedUser.documents
            },
        }));
    }
  }, [currentUser]);

  const addFormAnalysis = useCallback((analysis: FormAnalysis) => {
    if (currentUser) {
      const newAnalyses = [analysis, ...(currentUser.formAnalyses ?? [])].slice(0, 5);
      
      const updatedUser = {
        ...currentUser,
        formAnalyses: newAnalyses,
      };
      setCurrentUser(updatedUser);
      setUsersDB(prev => ({
        ...prev,
        [currentUser.username]: {
            ...prev[currentUser.username],
            formAnalyses: updatedUser.formAnalyses
        },
      }));
    }
  }, [currentUser]);

  const deleteFormAnalysis = useCallback((analysisId: string) => {
    if (currentUser) {
        const updatedAnalyses = currentUser.formAnalyses.filter(a => a.id !== analysisId);
        const updatedUser = {
            ...currentUser,
            formAnalyses: updatedAnalyses,
        };
        setCurrentUser(updatedUser);
        setUsersDB(prev => ({
            ...prev,
            [currentUser.username]: {
                ...prev[currentUser.username],
                formAnalyses: updatedUser.formAnalyses
            },
        }));
    }
  }, [currentUser]);


  return { currentUser, isLoading, signup, login, logout, addDocument, deleteDocument, updateDocument, addFormAnalysis, deleteFormAnalysis };
};