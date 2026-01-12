// Cliente Base44 usando fetch() para funcionar no Vercel (frontend externo)
// Substitui o SDK @base44/sdk que só funciona dentro do Base44

const BASE_URL = 'https://app.base44.com/api/apps/6963e16b0d60b23050220607';
const API_KEY = '99de92f827954ea8b42ec87e7c406b28';

// Headers padrão para todas as requisições
const getHeaders = () => ({
  'api_key': API_KEY,
  'Content-Type': 'application/json'
});

// Função genérica para fazer requisições
async function apiRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;

  const config = {
    headers: getHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== ENTITIES ====================

// Helper para criar funções CRUD para cada entidade
const createEntityAPI = (entityName) => ({
  list: async (limit = 100) => {
    return apiRequest(`/entities/${entityName}?limit=${limit}`);
  },

  get: async (id) => {
    return apiRequest(`/entities/${entityName}/${id}`);
  },

  filter: async (filters = {}, limit = 100) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });

    return apiRequest(`/entities/${entityName}?${queryParams.toString()}`);
  },

  create: async (data) => {
    return apiRequest(`/entities/${entityName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  update: async (id, data) => {
    return apiRequest(`/entities/${entityName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  delete: async (id) => {
    return apiRequest(`/entities/${entityName}/${id}`, {
      method: 'DELETE'
    });
  }
});

// ==================== AUTH (Sistema próprio com localStorage) ====================

const AUTH_STORAGE_KEY = 'doutorizze_auth';

const auth = {
  // Salvar usuário no localStorage
  saveUser: (user) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  // Obter usuário do localStorage
  getUser: () => {
    try {
      const data = localStorage.getItem(AUTH_STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  // Verificar se está autenticado
  isAuthenticated: async () => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  },

  // Obter usuário atual (compatível com base44.auth.me())
  me: async () => {
    const user = auth.getUser();
    if (!user) {
      throw new Error('Usuário não autenticado');
    }
    return user;
  },

  // Atualizar usuário atual
  updateMe: async (data) => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const updatedUser = await apiRequest(`/entities/User/${currentUser.id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });

    auth.saveUser({ ...currentUser, ...updatedUser });
    return updatedUser;
  },

  // Login com email e senha
  login: async (redirectPath = '/') => {
    // Redireciona para a página de login
    window.location.href = `/login?redirect=${encodeURIComponent(redirectPath)}`;
  },

  // Fazer login com credenciais
  loginWithCredentials: async (email, password) => {
    // Buscar usuário pelo email
    const users = await apiRequest(`/entities/User?email=${encodeURIComponent(email)}`);

    if (!users || users.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[0];

    // Verificar senha
    if (user.password !== password) {
      throw new Error('Senha incorreta');
    }

    // Salvar no localStorage
    auth.saveUser(user);
    return user;
  },

  // Cadastro de novo usuário
  register: async (userData) => {
    // Verificar se email já existe
    const existingUsers = await apiRequest(`/entities/User?email=${encodeURIComponent(userData.email)}`);

    if (existingUsers && existingUsers.length > 0) {
      throw new Error('Este email já está cadastrado');
    }

    // Criar usuário
    const newUser = await apiRequest('/entities/User', {
      method: 'POST',
      body: JSON.stringify({
        ...userData,
        created_at: new Date().toISOString()
      })
    });

    // Salvar no localStorage
    auth.saveUser(newUser);
    return newUser;
  },

  // Logout
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    window.location.href = '/';
  },

  // Método legado - redirecionar para login (não usa mais)
  redirectToLogin: (callbackUrl) => {
    window.location.href = '/login';
  }
};

// ==================== ENTITIES OBJECT (compatível com base44.entities) ====================

const entities = {
  // ==================== AUTENTICAÇÃO (2 entidades) ====================
  WhatsAppOTP: createEntityAPI('WhatsAppOTP'),
  EmailVerification: createEntityAPI('EmailVerification'),

  // ==================== USUÁRIOS (9 entidades) ====================
  Professional: createEntityAPI('Professional'),
  Company: createEntityAPI('Company'),
  CompanyOwner: createEntityAPI('CompanyOwner'),
  CompanyUnit: createEntityAPI('CompanyUnit'),
  Hospital: createEntityAPI('Hospital'),
  Supplier: createEntityAPI('Supplier'),
  EducationInstitution: createEntityAPI('EducationInstitution'),
  Laboratorio: createEntityAPI('Laboratorio'),
  ProfessionalAd: createEntityAPI('ProfessionalAd'),

  // ==================== VAGAS (3 entidades) ====================
  Job: createEntityAPI('Job'),
  JobMatch: createEntityAPI('JobMatch'),
  JobContract: createEntityAPI('JobContract'),

  // ==================== SUBSTITUIÇÕES (5 entidades) ====================
  SubstituicaoUrgente: createEntityAPI('SubstituicaoUrgente'),
  CandidaturaSubstituicao: createEntityAPI('CandidaturaSubstituicao'),
  ValidacaoComparecimento: createEntityAPI('ValidacaoComparecimento'),
  SuspensaoProfissional: createEntityAPI('SuspensaoProfissional'),
  BloqueioAgenda: createEntityAPI('BloqueioAgenda'),

  // ==================== CHAT (2 entidades) ====================
  ChatThread: createEntityAPI('ChatThread'),
  ChatMessage: createEntityAPI('ChatMessage'),

  // ==================== MARKETPLACE (3 entidades) ====================
  MarketplaceItem: createEntityAPI('MarketplaceItem'),
  MarketplaceChat: createEntityAPI('MarketplaceChat'),
  ProductRadar: createEntityAPI('ProductRadar'),

  // ==================== CONTEÚDO (1 entidade) ====================
  FeedPost: createEntityAPI('FeedPost'),

  // ==================== CURSOS (1 entidade) ====================
  Course: createEntityAPI('Course'),

  // ==================== PROMOÇÕES (1 entidade) ====================
  Promotion: createEntityAPI('Promotion'),

  // ==================== AVALIAÇÕES (1 entidade) ====================
  Rating: createEntityAPI('Rating'),

  // ==================== TOKENS (2 entidades) ====================
  TokenUsuario: createEntityAPI('TokenUsuario'),
  TokenDesconto: createEntityAPI('TokenDesconto'),

  // ==================== NOTIFICAÇÕES (3 entidades) ====================
  Notification: createEntityAPI('Notification'),
  NotificationPreference: createEntityAPI('NotificationPreference'),
  WhatsAppNotification: createEntityAPI('WhatsAppNotification'),

  // ==================== RELACIONAMENTOS (1 entidade) ====================
  VinculoProfissionalClinica: createEntityAPI('VinculoProfissionalClinica'),

  // ==================== PREFERÊNCIAS (1 entidade) ====================
  MatchPreferences: createEntityAPI('MatchPreferences'),

  // ==================== CRÉDITO (1 entidade) ====================
  PreSimulacao: createEntityAPI('PreSimulacao'),

  // ==================== SISTEMA (4 entidades) ====================
  Report: createEntityAPI('Report'),
  Favorito: createEntityAPI('Favorito'),
  TelegramAccess: createEntityAPI('TelegramAccess'),
  AuditLog: createEntityAPI('AuditLog'),

  // ==================== EXTRA (1 entidade) ====================
  Task: createEntityAPI('Task'),

  // ==================== USER (Built-in) ====================
  User: createEntityAPI('User')
};

// ==================== INTEGRATIONS ====================

const integrations = {
  Core: {
    SendEmail: async (params) => {
      console.warn('SendEmail não disponível no modo externo');
      return { success: false, message: 'Não disponível' };
    },
    UploadFile: async (params) => {
      console.warn('UploadFile não disponível no modo externo');
      return { success: false, message: 'Não disponível' };
    }
  }
};

// ==================== EXPORT ====================

export const base44 = {
  auth,
  entities,
  integrations
};

export default base44;
