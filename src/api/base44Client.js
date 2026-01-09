import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// Detectar se é localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "6916d492cc9abf019259139b",
  apiKey: import.meta.env.VITE_BASE44_API_KEY || "99de92f827954ea8b42ec87e7c406b28",
  baseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL,
  requiresAuth: false // Mantém desativado o redirect
});
