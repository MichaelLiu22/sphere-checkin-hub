
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define types for our user and auth context
interface User {
  id: string;
  full_name: string;
  user_type: 'admin' | 'staff' | 'visitor';
  feature: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// Hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Initialize - check if user is already logged in
  useEffect(() => {
    // Check local storage for user data
    const checkUserSession = () => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkUserSession();
  }, []);

  // Login function using Supabase to verify credentials
  const login = async (fullName: string, password: string) => {
    setLoading(true);
    try {
      // Query the users table for the matching full_name and password_hash
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('full_name', fullName)
        .eq('password_hash', password)
        .single();

      if (error) {
        toast.error("Invalid username or password");
        throw error;
      }

      if (data) {
        // Map database user_type to our application user_type
        let userType: 'admin' | 'staff' | 'visitor';
        
        if (data.user_type === 'admin') {
          userType = 'admin';
        } else if (data.user_type === 'staff') {
          userType = 'staff';
        } else {
          userType = 'visitor';
        }
        
        // Create user object with the correct types
        const userData: User = {
          id: data.id,
          full_name: data.full_name,
          user_type: userType,
          feature: data.feature || null
        };

        // Store user in local storage
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);

        // Redirect based on user type
        if (userData.user_type === 'admin') {
          navigate('/admin-dashboard');
        } else if (userData.user_type === 'staff') {
          navigate('/staff-dashboard');
        } else if (userData.user_type === 'visitor') {
          navigate('/guest');
        }
        
        toast.success("Login successful");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
    toast.success("Logged out successfully");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
