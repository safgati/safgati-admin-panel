import React, { useState, useEffect } from 'react';
import { db } from '../lib/database-supabase';

const Dashboard = () => {
  const [stats, setStats] = useState({});
  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // جلب الإحصائيات
      const currentStats = await db.getStats();
      setStats(currentStats);

      // جلب أحدث المنتجات
      const products = await db.getProducts();
      const recent = products
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      setRecentProducts(recent);
    } catch (error) {
      console.error('خطأ في جلب البيانات:', error);
    }
  };

  const statCards = [
    {
      title: 'إجمالي المنتجات',
      value: stats.totalProducts || 0,
      icon: '🛍️',
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive'
    },
    {
      title: 'الزوار الشهريين',
      value: (stats.monthlyVisitors || 0).toLocaleString(),
      icon: '👥',
      color: 'bg-green-500',
      change: '+8%',
      changeType: 'positive'
    },
    {
      title: 'معدل التحويل',
      value: `${stats.conversionRate || 0}%`,
      icon: '📈',
      color: 'bg-purple-500',
      change: '+2.1%',
      changeType: 'positive'
    },
    {
      title: 'إجمالي العمولات',
      value: `${stats.totalRevenue || 0} ر.س`,
      icon: '💰',
      color: 'bg-orange-500',
      change: '+15%',
      changeType: 'positive'
    }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">لوحة المعلومات</h1>
        <p className="text-gray-600">نظرة عامة على أداء متجرك</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">{card.title}</p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                <div className="flex items-center mt-2">
                  <span className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {card.change}
                  </span>
                  <span className="text-sm text-gray-500 mr-2">من الشهر الماضي</span>
                </div>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <span className="text-white text-xl">{card.icon}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">أحدث المنتجات</h2>
          <div className="space-y-4">
            {recentProducts.length > 0 ? (
              recentProducts.map((product) => (
                <div key={product.id} className="flex items-center space-x-4 space-x-reverse p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-12 h-12 rounded-lg object-cover"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/48x48?text=صورة';
                    }}
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-sm">{product.name}</h3>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-gray-900">{product.price} ر.س</p>
                    <p className="text-sm text-gray-500">⭐ {product.rating}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">لا توجد منتجات بعد</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">إجراءات سريعة</h2>
          <div className="space-y-3">
            <button className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-right">
              <span className="text-blue-600 text-xl">➕</span>
              <div>
                <p className="font-medium text-blue-900">إضافة منتج جديد</p>
                <p className="text-sm text-blue-600">أضف منتج جديد إلى متجرك</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors text-right">
              <span className="text-green-600 text-xl">📊</span>
              <div>
                <p className="font-medium text-green-900">عرض التحليلات</p>
                <p className="text-sm text-green-600">تحليل مفصل لأداء المتجر</p>
              </div>
            </button>
            
            <button className="w-full flex items-center space-x-3 space-x-reverse p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors text-right">
              <span className="text-purple-600 text-xl">⚙️</span>
              <div>
                <p className="font-medium text-purple-900">إعدادات المتجر</p>
                <p className="text-sm text-purple-600">تخصيص إعدادات المتجر</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

