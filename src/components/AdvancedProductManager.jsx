import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const AdvancedProductManager = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // حالة النموذج
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    features: [''],
    price: '',
    rating: 5,
    category: '',
    product_url: '',
    affiliate_url: '',
    images: []
  });

  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  // فئات المنتجات
  const categories = [
    'إلكترونيات',
    'أزياء',
    'منزل ومطبخ',
    'رياضة ولياقة',
    'جمال وعناية',
    'كتب وتعليم',
    'ألعاب وترفيه',
    'صحة وطب',
    'سيارات',
    'أخرى'
  ];

  // تحميل المنتجات
  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('خطأ في تحميل المنتجات:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // تحديث حقل في النموذج
  const updateFormField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // إضافة ميزة جديدة
  const addFeature = () => {
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  // حذف ميزة
  const removeFeature = (index) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  // تحديث ميزة
  const updateFeature = (index, value) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => i === index ? value : feature)
    }));
  };

  // معالجة رفع الصور
  const handleImageUpload = (files) => {
    const newImages = Array.from(files).map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...newImages]
    }));
  };

  // معالجة السحب والإفلات
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  // معالجة النسخ واللصق
  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    const files = [];
    
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        files.push(items[i].getAsFile());
      }
    }
    
    if (files.length > 0) {
      handleImageUpload(files);
    }
  };

  // حذف صورة
  const removeImage = (imageId) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter(img => img.id !== imageId)
    }));
  };

  // إعادة ترتيب الصور
  const moveImage = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newImages = [...prev.images];
      const [movedImage] = newImages.splice(fromIndex, 1);
      newImages.splice(toIndex, 0, movedImage);
      return {
        ...prev,
        images: newImages
      };
    });
  };

  // حفظ المنتج
  const saveProduct = async () => {
    try {
      setLoading(true);
      
      // تحضير البيانات
      const productData = {
        name: formData.name,
        description: formData.description,
        features: formData.features.filter(f => f.trim() !== ''),
        price: parseFloat(formData.price),
        rating: formData.rating,
        category: formData.category,
        product_url: formData.product_url,
        affiliate_url: formData.affiliate_url,
        images: formData.images.map(img => img.url) // في التطبيق الحقيقي، سنرفع الصور إلى التخزين السحابي
      };

      let result;
      if (editingProduct) {
        result = await supabase
          .from('products')
          .update(productData)
          .eq('id', editingProduct.id);
      } else {
        result = await supabase
          .from('products')
          .insert([productData]);
      }

      if (result.error) throw result.error;

      // إعادة تعيين النموذج
      setFormData({
        name: '',
        description: '',
        features: [''],
        price: '',
        rating: 5,
        category: '',
        product_url: '',
        affiliate_url: '',
        images: []
      });
      
      setShowAddForm(false);
      setEditingProduct(null);
      loadProducts();
      
    } catch (error) {
      console.error('خطأ في حفظ المنتج:', error);
      alert('حدث خطأ في حفظ المنتج');
    } finally {
      setLoading(false);
    }
  };

  // تحرير منتج
  const editProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      description: product.description || '',
      features: product.features || [''],
      price: product.price?.toString() || '',
      rating: product.rating || 5,
      category: product.category || '',
      product_url: product.product_url || '',
      affiliate_url: product.affiliate_url || '',
      images: (product.images || []).map((url, index) => ({
        id: index,
        url,
        name: `صورة ${index + 1}`
      }))
    });
    setShowAddForm(true);
  };

  // حذف منتج
  const deleteProduct = async (productId) => {
    if (!confirm('هل أنت متأكد من حذف هذا المنتج؟')) return;
    
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);
      
      if (error) throw error;
      loadProducts();
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error);
    }
  };

  // تصفية المنتجات
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // مكون تقييم النجوم
  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={readonly}
            onClick={() => !readonly && onRatingChange(star)}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${!readonly ? 'hover:text-yellow-500 cursor-pointer' : 'cursor-default'}`}
          >
            ★
          </button>
        ))}
        <span className="mr-2 text-sm text-gray-600">({rating}/5)</span>
      </div>
    );
  };

  React.useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  return (
    <div className="p-6" onPaste={handlePaste}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">إدارة المنتجات المتقدمة</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          إضافة منتج جديد
        </button>
      </div>

      {/* شريط البحث والفلترة */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="البحث في المنتجات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-48">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">جميع الفئات</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* نموذج إضافة/تحرير المنتج */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {editingProduct ? 'تحرير المنتج' : 'إضافة منتج جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                    setFormData({
                      name: '',
                      description: '',
                      features: [''],
                      price: '',
                      rating: 5,
                      category: '',
                      product_url: '',
                      affiliate_url: '',
                      images: []
                    });
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* العمود الأيسر - المعلومات الأساسية */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      اسم المنتج *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => updateFormField('name', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل اسم المنتج"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الوصف *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => updateFormField('description', e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="أدخل وصف المنتج"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        السعر (ريال) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => updateFormField('price', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="0.00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الفئة *
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => updateFormField('category', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="">اختر الفئة</option>
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التقييم
                    </label>
                    <StarRating
                      rating={formData.rating}
                      onRatingChange={(rating) => updateFormField('rating', rating)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط المنتج العادي
                    </label>
                    <input
                      type="url"
                      value={formData.product_url}
                      onChange={(e) => updateFormField('product_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://example.com/product"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      رابط الأفيليت
                    </label>
                    <input
                      type="url"
                      value={formData.affiliate_url}
                      onChange={(e) => updateFormField('affiliate_url', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="https://amzn.to/..."
                    />
                  </div>
                </div>

                {/* العمود الأيمن - الصور والمميزات */}
                <div className="space-y-4">
                  {/* قسم رفع الصور */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      صور المنتج
                    </label>
                    
                    {/* منطقة السحب والإفلات */}
                    <div
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <div className="text-gray-500">
                        <div className="text-4xl mb-2">📸</div>
                        <p className="text-sm">
                          اسحب الصور هنا أو انسخها والصقها (Ctrl+V)
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          أو انقر لاختيار الملفات
                        </p>
                      </div>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e.target.files)}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        اختيار الصور
                      </button>
                    </div>

                    {/* عرض الصور المرفوعة */}
                    {formData.images.length > 0 && (
                      <div className="mt-4">
                        <div className="grid grid-cols-2 gap-2">
                          {formData.images.map((image, index) => (
                            <div
                              key={image.id}
                              className="relative group border rounded-lg overflow-hidden"
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('text/plain', index.toString());
                              }}
                              onDragOver={(e) => e.preventDefault()}
                              onDrop={(e) => {
                                e.preventDefault();
                                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                                moveImage(fromIndex, index);
                              }}
                            >
                              <img
                                src={image.url}
                                alt={image.name}
                                className="w-full h-24 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                                <button
                                  type="button"
                                  onClick={() => removeImage(image.id)}
                                  className="opacity-0 group-hover:opacity-100 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                                >
                                  ×
                                </button>
                              </div>
                              <div className="absolute top-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                                {index + 1}
                              </div>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">
                          يمكنك سحب الصور لإعادة ترتيبها
                        </p>
                      </div>
                    )}
                  </div>

                  {/* قسم المميزات */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      مميزات المنتج
                    </label>
                    <div className="space-y-2">
                      {formData.features.map((feature, index) => (
                        <div key={index} className="flex gap-2">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => updateFeature(index, e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={`الميزة ${index + 1}`}
                          />
                          {formData.features.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeFeature(index)}
                              className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addFeature}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        + إضافة ميزة
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingProduct(null);
                  }}
                  className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveProduct}
                  disabled={loading || !formData.name || !formData.description}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري الحفظ...' : (editingProduct ? 'تحديث المنتج' : 'حفظ المنتج')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* قائمة المنتجات */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري التحميل...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد منتجات</h3>
            <p className="text-gray-600">ابدأ بإضافة منتج جديد</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المنتج
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الفئة
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    السعر
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التقييم
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {product.images && product.images[0] && (
                          <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-10 w-10 rounded-lg object-cover ml-4"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {product.name}
                          </div>
                          <div className="text-sm text-gray-500 max-w-xs truncate">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {product.category || 'غير محدد'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.price ? `${product.price} ر.س` : 'غير محدد'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StarRating rating={product.rating || 0} readonly />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => editProduct(product)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          تحرير
                        </button>
                        <button
                          onClick={() => deleteProduct(product.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          حذف
                        </button>
                        {product.affiliate_url && (
                          <a
                            href={product.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-600 hover:text-green-900"
                          >
                            شراء
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedProductManager;

