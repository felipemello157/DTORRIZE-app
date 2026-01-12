// Serviço de API centralizado para comunicação com Base44
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

    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ==================== ENTITIES ====================

export const entities = {
  // Listar todos os registros de uma entidade
  list: async (entityName, limit = 100) => {
    return apiRequest(`/entities/${entityName}?limit=${limit}`);
  },

  // Buscar um registro específico por ID
  get: async (entityName, id) => {
    return apiRequest(`/entities/${entityName}/${id}`);
  },

  // Filtrar registros
  filter: async (entityName, filters = {}, limit = 100) => {
    const queryParams = new URLSearchParams();
    queryParams.append('limit', limit);

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value);
      }
    });

    return apiRequest(`/entities/${entityName}?${queryParams.toString()}`);
  },

  // Criar um novo registro
  create: async (entityName, data) => {
    return apiRequest(`/entities/${entityName}`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Atualizar um registro
  update: async (entityName, id, data) => {
    return apiRequest(`/entities/${entityName}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Deletar um registro
  delete: async (entityName, id) => {
    return apiRequest(`/entities/${entityName}/${id}`, {
      method: 'DELETE'
    });
  }
};

// ==================== ENTIDADES ESPECÍFICAS ====================

// Helper para criar funções CRUD para cada entidade
const createEntityAPI = (entityName) => ({
  list: (limit) => entities.list(entityName, limit),
  get: (id) => entities.get(entityName, id),
  filter: (filters, limit) => entities.filter(entityName, filters, limit),
  create: (data) => entities.create(entityName, data),
  update: (id, data) => entities.update(entityName, id, data),
  delete: (id) => entities.delete(entityName, id)
});

// Exportar APIs específicas para cada entidade
export const Professional = createEntityAPI('Professional');
export const CompanyOwner = createEntityAPI('CompanyOwner');
export const Supplier = createEntityAPI('Supplier');
export const Hospital = createEntityAPI('Hospital');
export const Clinic = createEntityAPI('Clinic');
export const Job = createEntityAPI('Job');
export const JobApplication = createEntityAPI('JobApplication');
export const Substitution = createEntityAPI('Substitution');
export const SubstitutionApplication = createEntityAPI('SubstitutionApplication');
export const Course = createEntityAPI('Course');
export const CourseEnrollment = createEntityAPI('CourseEnrollment');
export const MarketplaceItem = createEntityAPI('MarketplaceItem');
export const Chat = createEntityAPI('Chat');
export const Message = createEntityAPI('Message');
export const Notification = createEntityAPI('Notification');
export const Review = createEntityAPI('Review');
export const Favorite = createEntityAPI('Favorite');
export const Token = createEntityAPI('Token');
export const Coupon = createEntityAPI('Coupon');
export const Report = createEntityAPI('Report');
export const FeedPost = createEntityAPI('FeedPost');
export const User = createEntityAPI('User');
export const Institution = createEntityAPI('Institution');
export const Laboratory = createEntityAPI('Laboratory');

// ==================== AUTH (Sistema próprio) ====================

const AUTH_STORAGE_KEY = 'doutorizze_auth';

export const auth = {
  // Salvar usuário no localStorage
  saveUser: (user) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  },

  // Obter usuário do localStorage
  getUser: () => {
    const data = localStorage.getItem(AUTH_STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Remover usuário (logout)
  removeUser: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Verificar se está autenticado
  isAuthenticated: () => {
    return !!localStorage.getItem(AUTH_STORAGE_KEY);
  },

  // Login com email e senha
  login: async (email, password) => {
    // Buscar usuário pelo email
    const users = await entities.filter('User', { email });

    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = users[0];

    // Verificar senha (em produção, usar hash!)
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
    const existingUsers = await entities.filter('User', { email: userData.email });

    if (existingUsers.length > 0) {
      throw new Error('Este email já está cadastrado');
    }

    // Criar usuário
    const newUser = await entities.create('User', {
      ...userData,
      created_at: new Date().toISOString()
    });

    // Salvar no localStorage
    auth.saveUser(newUser);
    return newUser;
  },

  // Logout
  logout: () => {
    auth.removeUser();
  },

  // Obter usuário atual
  me: () => {
    return auth.getUser();
  },

  // Atualizar usuário atual
  updateMe: async (data) => {
    const currentUser = auth.getUser();
    if (!currentUser) {
      throw new Error('Usuário não autenticado');
    }

    const updatedUser = await entities.update('User', currentUser.id, data);
    auth.saveUser(updatedUser);
    return updatedUser;
  }
};

// Exportar tudo como default também
export default {
  entities,
  auth,
  Professional,
  CompanyOwner,
  Supplier,
  Hospital,
  Clinic,
  Job,
  JobApplication,
  Substitution,
  SubstitutionApplication,
  Course,
  CourseEnrollment,
  MarketplaceItem,
  Chat,
  Message,
  Notification,
  Review,
  Favorite,
  Token,
  Coupon,
  Report,
  FeedPost,
  User,
  Institution,
  Laboratory
};
