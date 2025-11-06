import React from 'react';
import ReactDOM from 'react-dom/client';
// Fix: added .tsx extension
import App from './App.tsx';
// Fix: added .ts extension
import { NotificationProvider } from './contexts/NotificationContext.tsx';
import { AuthProvider } from './contexts/AuthContext.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <NotificationProvider>
      <AuthProvider>
          <App />
      </AuthProvider>
    </NotificationProvider>
  </React.StrictMode>
);