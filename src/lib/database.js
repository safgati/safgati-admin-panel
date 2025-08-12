// نظام قاعدة البيانات المحلية
class LocalDatabase {
  constructor() {
    this.storageKey = 'safgati_database';
    this.initializeDatabase();
  }

  initializeDatabase() {
    const existingData = localStorage.getItem(this.storageKey);
    if (!existingData) {
      const initialData = {
        products: [
          {
            id: 1,
            name: 'زجاجة رضاعة طبيعية للأطفال من مومكوزي',
            description: 'زجاجة رضاعة طبيعية بسعة 325 مل وعنق واسع لحفظ حليب الأم، مصنوعة من بلاستيك خال من مادة BPA ومتوافقة مع مبرد حليب الأم - 4 قطع',
            price: 92.52,
            category: 'منتجات الأطفال',
            image: 'https://images-na.ssl-images-amazon.com/images/I/61YQJ9X9XJL._AC_SL1500_.jpg',
            affiliateLink: 'https://amzn.to/3UJvZ9H',
            rating: 4.9,
            reviews: 209,
            brand: 'Momcozy',
            inStock: true,
            featured: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ],
        categories: [
          'منتجات الأطفال',
          'الإلكترونيات',
          'المنزل والحديقة',
          'الملابس والأزياء',
          'الصحة والجمال',
          'الرياضة واللياقة',
          'الكتب والوسائط',
          'السيارات'
        ],
        stats: {
          totalProducts: 1,
          totalSales: 0,
          totalRevenue: 0,
          monthlyVisitors: 1250,
          conversionRate: 3.2
        },
        users: [
          {
            id: 1,
            name: 'المدير العام',
            email: 'admin@safgati.com',
            role: 'admin',
            lastLogin: new Date().toISOString()
          }
        ]
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    }
  }

  getData() {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : null;
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // منتجات
  getProducts() {
    const data = this.getData();
    return data.products || [];
  }

  addProduct(product) {
    const data = this.getData();
    const newProduct = {
      ...product,
      id: Date.now(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data.products.push(newProduct);
    data.stats.totalProducts = data.products.length;
    this.saveData(data);
    return newProduct;
  }

  updateProduct(id, updates) {
    const data = this.getData();
    const productIndex = data.products.findIndex(p => p.id === id);
    
    if (productIndex !== -1) {
      data.products[productIndex] = {
        ...data.products[productIndex],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveData(data);
      return data.products[productIndex];
    }
    return null;
  }

  deleteProduct(id) {
    const data = this.getData();
    data.products = data.products.filter(p => p.id !== id);
    data.stats.totalProducts = data.products.length;
    this.saveData(data);
    return true;
  }

  // فئات
  getCategories() {
    const data = this.getData();
    return data.categories || [];
  }

  addCategory(category) {
    const data = this.getData();
    if (!data.categories.includes(category)) {
      data.categories.push(category);
      this.saveData(data);
    }
    return data.categories;
  }

  // إحصائيات
  getStats() {
    const data = this.getData();
    return data.stats || {};
  }

  updateStats(newStats) {
    const data = this.getData();
    data.stats = { ...data.stats, ...newStats };
    this.saveData(data);
    return data.stats;
  }

  // بحث
  searchProducts(query, category = null) {
    const products = this.getProducts();
    let filtered = products;

    if (query) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query.toLowerCase()) ||
        product.description.toLowerCase().includes(query.toLowerCase()) ||
        product.brand.toLowerCase().includes(query.toLowerCase())
      );
    }

    if (category && category !== 'الكل') {
      filtered = filtered.filter(product => product.category === category);
    }

    return filtered;
  }
}

export const db = new LocalDatabase();

