import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
// Fix: added .ts extension
import { Financials } from '../types.ts';
import { encryptData, decryptData } from '../services/cryptoService.ts';
// Fix: added .ts extension
import { mockData } from '../data/mockData.ts';

const STORAGE_KEY = 'hadjFinanceData_encrypted';

interface AuthContextType {
  isLocked: boolean;
  hasPasswordBeenSet: boolean;
  decryptedData: Financials | null;
  unlock: (password: string) => Promise<void>;
  lock: () => void;
  setPassword: (password: string) => Promise<void>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  resetPasswordAndData: () => Promise<void>;
  saveEncryptedData: (data: Financials) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState<string | null>(null);
  const [decryptedData, setDecryptedData] = useState<Financials | null>(null);
  const [hasPasswordBeenSet, setHasPasswordBeenSet] = useState(false);

  useEffect(() => {
    const storedData = localStorage.getItem(STORAGE_KEY);
    setHasPasswordBeenSet(!!storedData);
    // FIX: Removed setIsLocked(!!storedData) to prevent a race condition on first load.
    // The app should always start locked and let the user unlock or set a password.
  }, []);

  const unlock = async (pass: string) => {
    const encryptedJson = localStorage.getItem(STORAGE_KEY);
    if (!encryptedJson) {
      throw new Error("Aucune donnée n'a été trouvée.");
    }
    const data = await decryptData(encryptedJson, pass);
    setDecryptedData(data);
    setPassword(pass);
    setIsLocked(false);
  };

  const lock = () => {
    setPassword(null);
    setDecryptedData(null);
    setIsLocked(true);
  };

  const setPasswordAndEncryptData = async (pass: string, dataToEncrypt: Financials) => {
      const encryptedString = await encryptData(dataToEncrypt, pass);
      localStorage.setItem(STORAGE_KEY, encryptedString);
      setPassword(pass);
      setDecryptedData(dataToEncrypt);
      setIsLocked(false);
      setHasPasswordBeenSet(true);
  };

  const setPasswordFirstTime = (pass: string) => {
      return setPasswordAndEncryptData(pass, mockData);
  };
  
  const changePassword = async (oldPassword: string, newPassword: string) => {
      const currentEncrypted = localStorage.getItem(STORAGE_KEY);
      if(!currentEncrypted) throw new Error("Impossible de changer le mot de passe, aucune donnée trouvée.");

      // Verify old password by trying to decrypt
      const currentData = await decryptData(currentEncrypted, oldPassword);
      
      // If successful, re-encrypt with new password
      await setPasswordAndEncryptData(newPassword, currentData);
  };

  const resetPasswordAndData = async () => {
      localStorage.removeItem(STORAGE_KEY);
      setPassword(null);
      setDecryptedData(null);
      setIsLocked(true);
      setHasPasswordBeenSet(false);
  };

  const saveEncryptedData = useCallback(async (data: Financials) => {
    if (password) {
      try {
        const encryptedString = await encryptData(data, password);
        localStorage.setItem(STORAGE_KEY, encryptedString);
      } catch (error) {
        console.error("Failed to save and encrypt data:", error);
      }
    }
  }, [password]);


  return (
    <AuthContext.Provider value={{ 
        isLocked, 
        hasPasswordBeenSet, 
        decryptedData, 
        unlock, 
        lock, 
        setPassword: setPasswordFirstTime,
        changePassword,
        resetPasswordAndData,
        saveEncryptedData,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};