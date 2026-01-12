import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
// Detectar se é localhost
const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const base44 = createClient({
  appId: import.meta.env.VITE_BASE44_APP_ID || "6963e16b0d60b23050220607",
  apiKey: import.meta.env.VITE_BASE44_API_KEY,
  baseUrl: import.meta.env.VITE_BASE44_APP_BASE_URL || "https://vibe-health-copy-50220607.base44.app",
  requiresAuth: false // Vercel frontend + Base44 backend
});
