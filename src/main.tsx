import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// CRITICAL: Completely disable window.storage to prevent automatic Supabase syncing
// window.storage.set() triggers continuous auto-sync that causes infinite save loops
if (typeof window !== 'undefined' && window.storage) {
  console.log('🚫 Disabling window.storage auto-sync to prevent continuous Supabase saves');
  window.storage = {
    get: async () => ({ value: null }),
    set: async () => { /* disabled */ },
    remove: async () => { /* disabled */ }
  };
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<React.StrictMode><App /></React.StrictMode>);
}
