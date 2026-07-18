'use client';

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { api } from '@/lib/api';

interface Usuario {
  id: string;
  nombre: string;
  email: string;
}

interface AuthResponse {
  accessToken: string;
  usuario: Usuario;
}

interface AuthContextValue {
  usuario: Usuario | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (nombre: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = 'bills-planner:token';
const USUARIO_KEY = 'bills-planner:usuario';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUsuario = localStorage.getItem(USUARIO_KEY);

    if (storedToken && storedUsuario) {
      setToken(storedToken);
      setUsuario(JSON.parse(storedUsuario));
    }
    setLoading(false);
  }, []);

  function persistSession(response: AuthResponse) {
    localStorage.setItem(TOKEN_KEY, response.accessToken);
    localStorage.setItem(USUARIO_KEY, JSON.stringify(response.usuario));
    setToken(response.accessToken);
    setUsuario(response.usuario);
  }

  async function login(email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    persistSession(response);
  }

  async function register(nombre: string, email: string, password: string) {
    const response = await api.post<AuthResponse>('/auth/register', {
      nombre,
      email,
      password,
    });
    persistSession(response);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USUARIO_KEY);
    setToken(null);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider value={{ usuario, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}