import { supabase, trackClick } from './supabase.js'

// نظام قاعدة البيانات مع Supabase
class SupabaseDatabase {
  constructor() {
    this.fallbackToLocal = true // التراجع إلى localStorage في حالة عدم توفر الاتصال
  }

  // التحقق من الاتصال
  async checkConnection() {
    try {
      const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true })
      return !error
    } catch (error) {
      console.error('خطأ في الاتصال:', error)
      return false
    }
  }

  // المنتجات
  async getProducts() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error)
      
      // التراجع إلى localStorage
      if (this.fallbackToLocal) {
        return this.getProductsFromLocal()
      }
      return []
    }
  }

  async addProduct(product) {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([product])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('خطأ في إضافة المنتج:', error)
      
      // التراجع إلى localStorage
      if (this.fallbackToLocal) {
        return this.addProductToLocal(product)
      }
      throw error
    }
  }

  async updateProduct(id, updates) {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('خطأ في تحديث المنتج:', error)
      
      // التراجع إلى localStorage
      if (this.fallbackToLocal) {
        return this.updateProductInLocal(id, updates)
      }
      throw error
    }
  }

  async deleteProduct(id) {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
      return true
    } catch (error) {
      console.error('خطأ في حذف المنتج:', error)
      
      // التراجع إلى localStorage
      if (this.fallbackToLocal) {
        return this.deleteProductFromLocal(id)
      }
      throw error
    }
  }

  // الفئات
  async getCategories() {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('name')
        .order('name')

      if (error) throw error
      return ['الكل', ...data.map(cat => cat.name)]
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error)
      
      // التراجع إلى القيم الافتراضية
      return [
        'الكل',
        'منتجات الأطفال',
        'الإلكترونيات',
        'المنزل والحديقة',
        'الملابس والأزياء',
        'الصحة والجمال',
        'الرياضة واللياقة',
        'الكتب والوسائط',
        'السيارات'
      ]
    }
  }

  async addCategory(categoryName) {
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: categoryName }])
        .select()

      if (error) throw error
      return data
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error)
      throw error
    }
  }

  // الإحصائيات
  async getStats() {
    try {
      const { data, error } = await supabase
        .from('stats')
        .select('*')
        .single()

      if (error) throw error
      return data || {
        total_products: 0,
        total_sales: 0,
        total_revenue: 0,
        monthly_visitors: 1250,
        conversion_rate: 3.2
      }
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error)
      
      // إرجاع قيم افتراضية
      return {
        total_products: 0,
        total_sales: 0,
        total_revenue: 0,
        monthly_visitors: 1250,
        conversion_rate: 3.2
      }
    }
  }

  async updateStats(newStats) {
    try {
      const { data, error } = await supabase
        .from('stats')
        .upsert(newStats)
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('خطأ في تحديث الإحصائيات:', error)
      throw error
    }
  }

  // البحث
  async searchProducts(query, category = null) {
    try {
      let queryBuilder = supabase
        .from('products')
        .select('*')

      if (query) {
        queryBuilder = queryBuilder.or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
      }

      if (category && category !== 'الكل') {
        queryBuilder = queryBuilder.eq('category', category)
      }

      const { data, error } = await queryBuilder.order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('خطأ في البحث:', error)
      
      // التراجع إلى البحث المحلي
      if (this.fallbackToLocal) {
        return this.searchProductsLocal(query, category)
      }
      return []
    }
  }

  // تسجيل النقرات
  async trackProductClick(productId, userInfo = {}) {
    try {
      return await trackClick(productId, userInfo)
    } catch (error) {
      console.error('خطأ في تسجيل النقرة:', error)
      return { success: false, error: error.message }
    }
  }

  // دوال التراجع إلى localStorage
  getProductsFromLocal() {
    const data = localStorage.getItem('safgati_database')
    if (data) {
      const parsed = JSON.parse(data)
      return parsed.products || []
    }
    return []
  }

  addProductToLocal(product) {
    const data = JSON.parse(localStorage.getItem('safgati_database') || '{"products":[]}')
    const newProduct = {
      ...product,
      id: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    data.products.push(newProduct)
    localStorage.setItem('safgati_database', JSON.stringify(data))
    return newProduct
  }

  updateProductInLocal(id, updates) {
    const data = JSON.parse(localStorage.getItem('safgati_database') || '{"products":[]}')
    const productIndex = data.products.findIndex(p => p.id === id)
    
    if (productIndex !== -1) {
      data.products[productIndex] = {
        ...data.products[productIndex],
        ...updates,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem('safgati_database', JSON.stringify(data))
      return data.products[productIndex]
    }
    return null
  }

  deleteProductFromLocal(id) {
    const data = JSON.parse(localStorage.getItem('safgati_database') || '{"products":[]}')
    data.products = data.products.filter(p => p.id !== id)
    localStorage.setItem('safgati_database', JSON.stringify(data))
    return true
  }

  searchProductsLocal(query, category) {
    const products = this.getProductsFromLocal()
    let filtered = products

    if (query) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      )
    }

    if (category && category !== 'الكل') {
      filtered = filtered.filter(product => product.category === category)
    }

    return filtered
  }
}

export const db = new SupabaseDatabase()

