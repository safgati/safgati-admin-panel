import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      id: 'dashboard',
      name: 'لوحة المعلومات',
      icon: '📊',
      roles: ['admin', 'editor']
    },
    {
      id: 'products',
      name: 'إدارة المنتجات',
      icon: '🛍️',
      roles: ['admin', 'editor']
    },
    {
      id: 'analytics',
      name: 'التحليلات',
      icon: '📈',
      roles: ['admin']
    },
    {
      id: 'users',
      name: 'إدارة المستخدمين',
      icon: '👥',
      roles: ['admin']
    },
    {
      id: 'settings',
      name: 'الإعدادات',
      icon: '⚙️',
      roles: ['admin', 'editor']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="bg-white shadow-lg h-screen w-64 fixed right-0 top-0 z-30 border-l border-gray-200">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-lg">ص</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">صفقاتي</h1>
            <p className="text-sm text-gray-500">لوحة التحكم</p>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <span className="text-blue-600 font-medium text-sm">{user?.avatar}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{user?.name}</p>
            <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'مدير' : 'محرر'}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-4">
        <ul className="space-y-2">
          {filteredMenuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 space-x-reverse px-4 py-3 text-right rounded-lg transition-colors duration-200 ${
                  activeTab === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-4 border-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="font-medium">{item.name}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-4 right-4">
        <button
          onClick={logout}
          className="w-full flex items-center justify-center space-x-2 space-x-reverse px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
        >
          <span>🚪</span>
          <span className="font-medium">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

