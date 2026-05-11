import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { getSavedUser } from './storage';
import type { AppUser } from './types';

type AuthContextValue = {
  user: AppUser | null;
  setUser: (user: AppUser | null) => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  setUser: () => {},
  loading: true,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSavedUser()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
