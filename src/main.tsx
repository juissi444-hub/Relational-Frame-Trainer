import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// CRITICAL: Completely disable window.storage to prevent automatic Supabase syncing
// window.storage.set() triggers continuous auto-sync that causes infinite save loops

// Method 1: Override window.storage immediately
if (typeof window !== 'undefined') {
  console.log('🚫 Disabling window.storage auto-sync to prevent continuous Supabase saves');

  // Create a no-op storage object
  const noopStorage = {
    get: async () => { console.log('❌ window.storage.get() blocked'); return { value: null }; },
    set: async () => { console.log('❌ window.storage.set() blocked'); },
    remove: async () => { console.log('❌ window.storage.remove() blocked'); }
  };

  // Override window.storage with Object.defineProperty to prevent re-assignment
  Object.defineProperty(window, 'storage', {
    value: noopStorage,
    writable: false,
    configurable: false
  });

  // Method 2: Block all Supabase network requests at fetch level
  const originalFetch = window.fetch;
  window.fetch = function(...args) {
    const url = typeof args[0] === 'string' ? args[0] : args[0]?.url;
    if (url && url.includes('supabase.co')) {
      console.log('🚫 Blocked Supabase fetch request to:', url);
      return Promise.resolve(new Response('{"blocked": true}', {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    return originalFetch.apply(this, args);
  };

  // Method 3: Continuously check and re-block window.storage every 100ms
  // (in case Discord or another script tries to re-inject it)
  setInterval(() => {
    if (window.storage && window.storage !== noopStorage) {
      console.warn('⚠️ window.storage was re-injected! Blocking it again...');
      Object.defineProperty(window, 'storage', {
        value: noopStorage,
        writable: false,
        configurable: false
      });
    }
  }, 100);

  console.log('✅ All window.storage auto-sync protection measures active');
}

const rootEl = document.getElementById('root');
if (rootEl) {
  createRoot(rootEl).render(<React.StrictMode><App /></React.StrictMode>);
}
