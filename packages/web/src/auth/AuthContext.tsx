import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { LoginRequest, RegisterRequest, UserDto } from '@marketplace/shared';
import { api, getToken, setToken } from '../api/client';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

interface AuthContextValue {
  user: UserDto | null;
  status: AuthStatus;
  login: (input: LoginRequest) => Promise<void>;
  register: (input: RegisterRequest) => Promise<void>;
  logout: () => void;
  setUser: (user: UserDto) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [status, setStatus] = useState<AuthStatus>(() =>
    getToken() ? 'loading' : 'anonymous',
  );

  useEffect(() => {
    if (!getToken()) {
      return;
    }

    let active = true;
    api
      .me()
      .then((currentUser) => {
        if (!active) return;
        setUser(currentUser);
        setStatus('authenticated');
      })
      .catch(() => {
        setToken(null);
        if (active) {
          setStatus('anonymous');
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (input: LoginRequest) => {
    const result = await api.login(input);
    setToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (input: RegisterRequest) => {
    const result = await api.register(input);
    setToken(result.accessToken);
    setUser(result.user);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setStatus('anonymous');
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, status, login, register, logout, setUser }),
    [user, status, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
