import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { useNotifier } from './NotificationContext.tsx';

const API_KEY_STORAGE_KEY = 'hadj-finance-api-key';

interface ApiContextType {
  ai: GoogleGenAI | null;
  isApiAvailable: boolean;
  initializationError: string | null;
  isApiKeyModalOpen: boolean;
  openApiKeyModal: () => void;
  closeApiKeyModal: () => void;
  setApiKey: (key: string) => Promise<void>;
}

const ApiContext = createContext<ApiContextType | undefined>(undefined);

export const ApiProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ai, setAi] = useState<GoogleGenAI | null>(null);
  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const notifier = useNotifier();

  const initializeAi = useCallback((apiKey: string) => {
    try {
      if (!apiKey) {
        throw new Error("Clé API non fournie.");
      }
      const genAI = new GoogleGenAI({ apiKey });
      setAi(genAI);
      setInitializationError(null);
      return true;
    } catch (error) {
      const message = (error instanceof Error) ? error.message : "Erreur inconnue lors de l'initialisation de l'API.";
      console.error("Gemini API Initialization Error:", message);
      setInitializationError(message);
      setAi(null);
      localStorage.removeItem(API_KEY_STORAGE_KEY);
      return false;
    }
  }, []);

  useEffect(() => {
    const storedApiKey = localStorage.getItem(API_KEY_STORAGE_KEY);
    const providedApiKey = 'AIzaSyDQ36ri2Dm0BqLrynMxRd8bywmD5L4Jglw';

    if (storedApiKey) {
        initializeAi(storedApiKey);
    } else if (providedApiKey) {
        initializeAi(providedApiKey);
    } else {
        setInitializationError("Clé API Gemini non configurée.");
    }
  }, [initializeAi]);

  const openApiKeyModal = () => setIsApiKeyModalOpen(true);
  const closeApiKeyModal = () => setIsApiKeyModalOpen(false);

  const setApiKey = async (key: string): Promise<void> => {
    const success = initializeAi(key);
    if(success) {
        localStorage.setItem(API_KEY_STORAGE_KEY, key);
        notifier.success("Clé API sauvegardée et activée !");
    } else {
        throw new Error("Initialization failed with the provided key.");
    }
  };

  const value = {
    ai,
    isApiAvailable: !!ai,
    initializationError,
    isApiKeyModalOpen,
    openApiKeyModal,
    closeApiKeyModal,
    setApiKey,
  };

  return (
    <ApiContext.Provider value={value}>
      {children}
    </ApiContext.Provider>
  );
};

export const useApi = (): ApiContextType => {
  const context = useContext(ApiContext);
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider');
  }
  return context;
};