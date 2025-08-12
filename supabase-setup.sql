-- إعداد قاعدة البيانات لمشروع صفقاتي - بيئة Staging
-- Supabase SQL Setup

-- إنشاء جدول المنتجات
CREATE TABLE IF NOT EXISTS products (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    category TEXT,
    image TEXT,
    affiliate_link TEXT NOT NULL,
    brand TEXT,
    rating DECIMAL(2,1) DEFAULT 5.0,
    reviews INTEGER DEFAULT 0,
    in_stock BOOLEAN DEFAULT true,
    featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الفئات
CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,
    name TEXT UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول المستخدمين
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'editor' CHECK (role IN ('admin', 'editor', 'viewer')),
    avatar TEXT,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول الإحصائيات
CREATE TABLE IF NOT EXISTS stats (
    id BIGSERIAL PRIMARY KEY,
    total_products INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_revenue DECIMAL(10,2) DEFAULT 0,
    monthly_visitors INTEGER DEFAULT 0,
    conversion_rate DECIMAL(4,2) DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول تتبع النقرات
CREATE TABLE IF NOT EXISTS click_tracking (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT REFERENCES products(id),
    user_ip TEXT,
    user_agent TEXT,
    referrer TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إدراج البيانات الأولية

-- إدراج الفئات الافتراضية
INSERT INTO categories (name, description) VALUES
('منتجات الأطفال', 'منتجات خاصة بالأطفال والرضع'),
('الإلكترونيات', 'أجهزة إلكترونية ومعدات تقنية'),
('المنزل والحديقة', 'أدوات منزلية ومعدات الحديقة'),
('الملابس والأزياء', 'ملابس وإكسسوارات'),
('الصحة والجمال', 'منتجات العناية والجمال'),
('الرياضة واللياقة', 'معدات رياضية ولياقة بدنية'),
('الكتب والوسائط', 'كتب ووسائط تعليمية'),
('السيارات', 'قطع غيار ومعدات السيارات')
ON CONFLICT (name) DO NOTHING;

-- إدراج المنتج الأول (زجاجات الرضاعة)
INSERT INTO products (
    name, 
    description, 
    price, 
    category, 
    image, 
    affiliate_link, 
    brand, 
    rating, 
    reviews, 
    in_stock, 
    featured
) VALUES (
    'زجاجة رضاعة طبيعية للأطفال من مومكوزي',
    'زجاجة رضاعة طبيعية بسعة 325 مل وعنق واسع لحفظ حليب الأم، مصنوعة من بلاستيك خال من مادة البيسفينول ايه (BPA) ومتوافقة مع مبرد حليب الأم - 4 قطع',
    92.52,
    'منتجات الأطفال',
    'https://images-na.ssl-images-amazon.com/images/I/61YQJ9X9XJL._AC_SL1500_.jpg',
    'https://amzn.to/3UJvZ9H',
    'Momcozy',
    4.9,
    209,
    true,
    true
) ON CONFLICT DO NOTHING;

-- إدراج المستخدم الافتراضي
INSERT INTO users (email, name, role, avatar) VALUES
('admin@safgati.com', 'المدير العام', 'admin', 'A'),
('editor@safgati.com', 'محرر المحتوى', 'editor', 'E')
ON CONFLICT (email) DO NOTHING;

-- إدراج الإحصائيات الأولية
INSERT INTO stats (total_products, monthly_visitors, conversion_rate) VALUES
(1, 1250, 3.2)
ON CONFLICT DO NOTHING;

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_featured ON products(featured);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_click_tracking_product_id ON click_tracking(product_id);
CREATE INDEX IF NOT EXISTS idx_click_tracking_clicked_at ON click_tracking(clicked_at);

-- إنشاء دالة لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء triggers لتحديث updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إنشاء دالة لتحديث إحصائيات المنتجات
CREATE OR REPLACE FUNCTION update_product_stats()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE stats SET 
        total_products = (SELECT COUNT(*) FROM products),
        updated_at = NOW();
    RETURN NULL;
END;
$$ language 'plpgsql';

-- إنشاء trigger لتحديث الإحصائيات عند إضافة/حذف منتج
CREATE TRIGGER update_stats_on_product_change
    AFTER INSERT OR DELETE ON products
    FOR EACH STATEMENT EXECUTE FUNCTION update_product_stats();

-- تفعيل Row Level Security (RLS)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE click_tracking ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسات الأمان (للقراءة العامة)
CREATE POLICY "Enable read access for all users" ON products FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON stats FOR SELECT USING (true);

-- سياسات للكتابة (تحتاج مصادقة)
CREATE POLICY "Enable insert for authenticated users only" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Enable update for authenticated users only" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Enable delete for authenticated users only" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- سياسة لتتبع النقرات (للجميع)
CREATE POLICY "Enable insert for click tracking" ON click_tracking FOR INSERT WITH CHECK (true);

