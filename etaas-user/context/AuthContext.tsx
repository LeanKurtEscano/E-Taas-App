import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useCurrentUser } from '@/store/useCurrentUserStore';
import { AppUser } from '@/types/user/currentUser';
interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
 
  const [loading, setLoading] = useState(true);
  
  const userData = useCurrentUser((state) => state.userData);
  const fetchCurrentUser = useCurrentUser((state) => state.fetchCurrentUser);

  useEffect(() => {
    if (!userData) {
      fetchCurrentUser(); // fetch user from API if not already in store
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user: userData, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);