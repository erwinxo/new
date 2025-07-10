import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  bio: string;
  profilePicture?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (userData: SignupData) => Promise<void>;
  logout: () => void;
  updateProfile: (userData: Partial<User>) => Promise<void>;
  isLoading: boolean;
}

interface SignupData {
  name: string;
  username: string;
  email: string;
  password: string;
  bio?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth token and validate with backend
    const token = localStorage.getItem('authToken');
    if (token) {
      // Verify token with backend
      apiService.getCurrentUser()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          // Token is invalid, remove it
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await apiService.login(email, password);
      const { access_token, user: userData } = response;
      
      setUser({
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        bio: userData.bio,
        profilePicture: userData.profile_picture,
        createdAt: userData.created_at
      });
      
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (userData: SignupData) => {
    setIsLoading(true);
    try {
      const response = await apiService.signup(userData);
      const { access_token, user: newUserData } = response;
      
      const newUser: User = {
        id: newUserData.id,
        name: newUserData.name,
        username: newUserData.username,
        email: newUserData.email,
        bio: newUserData.bio,
        profilePicture: newUserData.profile_picture,
        createdAt: newUserData.created_at
      };
      
      setUser(newUser);
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('user', JSON.stringify(newUserData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  };

  const updateProfile = async (userData: Partial<User>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const updatedUserData = await apiService.updateProfile({
        name: userData.name,
        username: userData.username,
        email: userData.email,
        bio: userData.bio,
        profile_picture: userData.profilePicture
      });
      
      const updatedUser = { ...user, ...userData, profilePicture: updatedUserData.profile_picture };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateProfile,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};