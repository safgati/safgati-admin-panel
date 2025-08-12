import React, { useState, useEffect } from 'react';
import { db } from '../lib/database-supabase';
import { Button } from '@/components/ui/button';

const ProductsManager = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('الكل');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // نموذج المنتج الجديد
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    image: '',
    affiliateLink: '',
    brand: '',
    rating: 5,
    reviews: 0,
    inStock: true,
    featured: false
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const allProducts = await db.getProducts();
      setProducts(allProducts);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const allCategories = await db.getCategories();
      setCategories(allCategories);
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'الكل' || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleAddProduct = async () => {
    if (!newProduct.name || !newProduct.price || !newProduct.affiliateLink) {
      alert('يرجى ملء الحقول المطلوبة');
      return;
    }

    try {
      const productData = {
        ...newProduct,
        price: parseFloat(newProduct.price),
        rating: parseFloat(newProduct.rating),
        reviews: parseInt(newProduct.reviews) || 0
      };

      if (editingProduct) {
        await db.updateProduct(editingProduct.id, productData);
        setEditingProduct(null);
      } else {
        await db.addProduct(productData);
      }

      // إعادة تعيين النموذج
      setNewProduct({
        name: '',
        description: '',
        price: '',
        category: '',
        image: '',
        affiliateLink: '',
        brand: '',
        rating: 5,
        reviews: 0,
        inStock: true,
        featured: false
      });

      setShowAddForm(false);
      await loadProducts();
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      alert('حدث خطأ في حفظ المنتج. يرجى المحاولة مرة أخرى.');
    }
  };

  const handleEditProduct = (product) => {
    setNewProduct(product);
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDeleteProduct = async (id) => {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      try {
        await db.deleteProduct(id);
        await loadProducts();
      } catch (error) {
        console.error('خطأ في حذف المنتج:', error);
        alert('حدث خطأ في حذف المنتج. يرجى المحاولة مرة أخرى.');
      }
    }
  };

  const handleTestAffiliateLink = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المنتجات</h1>
          <p className="text-gray-600">إضافة وتعديل وإدارة منتجات متجرك</p>
        </div>
        <Button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          ➕ إضافة منتج جديد
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Add/Edit Product Form */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'تعديل المنتج' : 'إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setNewProduct({
                      name: '',
                      description: '',
                      price: '',
                      category: '',
                      image: '',
                      affiliateLink: '',
                      brand: '',
                      rating: 5,
                      reviews: 0,
                      inStock: true,
                      featured: false
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    اسم المنتج *
                  </label>
                  <input
                    type="text"
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="أدخل اسم المنتج"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوصف
                  </label>
                  <textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="وصف المنتج"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      السعر (ر.س) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={newProduct.price}
                      onChange={(e) => setNewProduct({...newProduct, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الفئة
                    </label>
                    <select
                      value={newProduct.category}
                      onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">اختر الفئة</option>
                      {categories.filter(cat => cat !== 'الكل').map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رابط الصورة
                  </label>
                  <input
                    type="url"
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رابط التسويق بالعمولة *
                  </label>
                  <input
                    type="url"
                    value={newProduct.affiliateLink}
                    onChange={(e) => setNewProduct({...newProduct, affiliateLink: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://amzn.to/..."
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      العلامة التجارية
                    </label>
                    <input
                      type="text"
                      value={newProduct.brand}
                      onChange={(e) => setNewProduct({...newProduct, brand: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="اسم العلامة التجارية"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      التقييم
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="5"
                      step="0.1"
                      value={newProduct.rating}
                      onChange={(e) => setNewProduct({...newProduct, rating: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد التقييمات
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newProduct.reviews}
                      onChange={(e) => setNewProduct({...newProduct, reviews: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4 space-x-reverse">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.inStock}
                      onChange={(e) => setNewProduct({...newProduct, inStock: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">متوفر في المخزون</span>
                  </label>

                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newProduct.featured}
                      onChange={(e) => setNewProduct({...newProduct, featured: e.target.checked})}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="mr-2 text-sm text-gray-700">منتج مميز</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 space-x-reverse mt-6">
                <Button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  variant="outline"
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddProduct}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingProduct ? 'حفظ التغييرات' : 'إضافة المنتج'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => (
          <div key={product.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="relative">
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/300x200?text=صورة+المنتج';
                }}
              />
              {product.featured && (
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                  مميز
                </div>
              )}
            </div>

            <div className="p-4">
              <h3 className="font-bold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-lg font-bold text-blue-600">{product.price} ر.س</span>
                <div className="flex items-center">
                  <span className="text-yellow-500">⭐</span>
                  <span className="text-sm text-gray-600 mr-1">{product.rating} ({product.reviews})</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{product.category}</span>
                <span>{product.brand}</span>
              </div>

              <div className="flex space-x-2 space-x-reverse">
                <Button
                  onClick={() => handleEditProduct(product)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  ✏️ تعديل
                </Button>
                <Button
                  onClick={() => handleTestAffiliateLink(product.affiliateLink)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  🔗 اختبار
                </Button>
                <Button
                  onClick={() => handleDeleteProduct(product.id)}
                  variant="outline"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  🗑️
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-6xl mb-4">📦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || selectedCategory !== 'الكل' 
              ? 'لم يتم العثور على منتجات تطابق البحث'
              : 'ابدأ بإضافة منتجك الأول'
            }
          </p>
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            إضافة منتج جديد
          </Button>
        </div>
      )}
    </div>
  );
};

export default ProductsManager;

