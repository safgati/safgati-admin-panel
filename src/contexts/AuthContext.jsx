import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // المستخدمون المسموح لهم
  const allowedUsers = [
    {
      id: 1,
      email: 'admin@safgati.com',
      password: 'admin123',
      name: 'المدير العام',
      role: 'admin',
      avatar: 'A'
    },
    {
      id: 2,
      email: 'editor@safgati.com',
      password: 'editor123',
      name: 'محرر المحتوى',
      role: 'editor',
      avatar: 'E'
    }
  ];

  useEffect(() => {
    // فحص إذا كان المستخدم مسجل دخول مسبقاً
    const savedUser = localStorage.getItem('safgati_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const foundUser = allowedUsers.find(
      u => u.email === email && u.password === password
    );

    if (foundUser) {
      const userWithoutPassword = { ...foundUser };
      delete userWithoutPassword.password;
      
      setUser(userWithoutPassword);
      localStorage.setItem('safgati_user', JSON.stringify(userWithoutPassword));
      return { success: true };
    } else {
      return { success: false, error: 'بيانات الدخول غير صحيحة' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('safgati_user');
  };

  const value = {
    user,
    login,
    logout,
    loading,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

