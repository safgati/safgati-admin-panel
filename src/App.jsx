import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ProductsManager from './components/ProductsManager';
import './App.css';

// مكون التحليلات (مؤقت)
const Analytics = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">التحليلات</h1>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">📊</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">قريباً</h2>
      <p className="text-gray-600">سيتم إضافة تحليلات مفصلة قريباً</p>
    </div>
  </div>
);

// مكون إدارة المستخدمين (مؤقت)
const UsersManager = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">إدارة المستخدمين</h1>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">👥</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">قريباً</h2>
      <p className="text-gray-600">سيتم إضافة إدارة المستخدمين قريباً</p>
    </div>
  </div>
);

// مكون الإعدادات (مؤقت)
const Settings = () => (
  <div className="p-6">
    <h1 className="text-3xl font-bold text-gray-900 mb-4">الإعدادات</h1>
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div className="text-6xl mb-4">⚙️</div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">قريباً</h2>
      <p className="text-gray-600">سيتم إضافة صفحة الإعدادات قريباً</p>
    </div>
  </div>
);

const MainApp = () => {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'products':
        return <ProductsManager />;
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UsersManager />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mr-64">
        {renderContent()}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
