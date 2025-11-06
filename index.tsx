import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: added .tsx extension
import App from './App.tsx';
// Fix: added .ts extension
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';
import { ApiProvider } from './contexts/ApiContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
        <ApiProvider>
          <App />
        </ApiProvider>
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);