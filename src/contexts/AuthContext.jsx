import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, Professional, CompanyOwner, Supplier, Hospital } from '@/services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userType, setUserType] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Carregar usuário do localStorage ao iniciar
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const savedUser = auth.getUser();
      if (savedUser) {
        setUser(savedUser);
        await detectUserType(savedUser);
      }
    } catch (error) {
      console.error('Erro ao carregar usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  // Detectar tipo de usuário (profissional, clínica, etc)
  const detectUserType = async (currentUser) => {
    if (!currentUser?.id) return null;

    try {
      const [professionals, owners, suppliers, hospitals] = await Promise.all([
        Professional.filter({ user_id: currentUser.id }).catch(() => []),
        CompanyOwner.filter({ user_id: currentUser.id }).catch(() => []),
        Supplier.filter({ user_id: currentUser.id }).catch(() => []),
        Hospital.filter({ user_id: currentUser.id }).catch(() => [])
      ]);

      let type = null;
      let profile = null;

      if (professionals.length > 0) {
        type = 'PROFISSIONAL';
        profile = professionals[0];
      } else if (owners.length > 0) {
        type = 'CLINICA';
        profile = owners[0];
      } else if (suppliers.length > 0) {
        type = 'FORNECEDOR';
        profile = suppliers[0];
      } else if (hospitals.length > 0) {
        type = 'HOSPITAL';
        profile = hospitals[0];
      }

      setUserType(type);
      setUserProfile(profile);
      return type;
    } catch (error) {
      console.error('Erro ao detectar tipo de usuário:', error);
      return null;
    }
  };

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const loggedUser = await auth.login(email, password);
      setUser(loggedUser);
      await detectUserType(loggedUser);
      return loggedUser;
    } finally {
      setLoading(false);
    }
  };

  // Cadastro
  const register = async (userData) => {
    setLoading(true);
    try {
      const newUser = await auth.register(userData);
      setUser(newUser);
      return newUser;
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    auth.logout();
    setUser(null);
    setUserType(null);
    setUserProfile(null);
  };

  // Atualizar dados do usuário
  const updateUser = async (data) => {
    try {
      const updatedUser = await auth.updateMe(data);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  };

  // Recarregar perfil do usuário
  const refreshProfile = async () => {
    if (user) {
      await detectUserType(user);
    }
  };

  const value = {
    user,
    userType,
    userProfile,
    loading,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateUser,
    refreshProfile,
    detectUserType
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}

export default AuthContext;
