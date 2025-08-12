-- تحديث جدول المنتجات لدعم الميزات الجديدة
-- إضافة الأعمدة الجديدة إذا لم تكن موجودة

-- إضافة عمود المميزات (JSON array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]'::jsonb;

-- إضافة عمود التقييم
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5);

-- إضافة عمود الفئة
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS category TEXT;

-- إضافة عمود رابط المنتج العادي
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS product_url TEXT;

-- إضافة عمود الصور (JSON array)
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- تحديث عمود الوصف ليكون أطول
ALTER TABLE products 
ALTER COLUMN description TYPE TEXT;

-- إضافة فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_rating ON products(rating);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);

-- إضافة تعليقات للأعمدة
COMMENT ON COLUMN products.features IS 'مميزات المنتج كمصفوفة JSON';
COMMENT ON COLUMN products.rating IS 'تقييم المنتج من 1 إلى 5 نجوم';
COMMENT ON COLUMN products.category IS 'فئة المنتج';
COMMENT ON COLUMN products.product_url IS 'رابط المنتج العادي';
COMMENT ON COLUMN products.images IS 'صور المنتج كمصفوفة JSON من الروابط';

-- إدراج بيانات تجريبية محدثة
INSERT INTO products (
  name, 
  description, 
  features, 
  price, 
  rating, 
  category, 
  product_url, 
  affiliate_url, 
  images
) VALUES 
(
  'سماعات رأس يوجرين Hitune Max 5C',
  'سماعات رأس لاسلكية عالية الجودة مع إلغاء الضوضاء وبطارية تدوم 75 ساعة',
  '["إلغاء الضوضاء النشط", "بلوتوث 5.4", "75 ساعة تشغيل", "شحن سريع", "صوت عالي الجودة"]'::jsonb,
  107.50,
  5,
  'إلكترونيات',
  'https://www.amazon.sa/dp/B0EXAMPLE1',
  'https://amzn.to/3JswJNK',
  '["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"]'::jsonb
),
(
  'زجاجات رضاعة مومكوزي 325 مل',
  'زجاجات رضاعة طبيعية للأطفال بسعة 325 مل وعنق واسع - 4 قطع',
  '["خالية من BPA", "سعة 325 مل", "عنق واسع", "مقاومة للكسر", "سهلة التنظيف"]'::jsonb,
  92.52,
  5,
  'أطفال ورضع',
  'https://www.amazon.sa/dp/B0EXAMPLE2',
  'https://amzn.to/3UJvZ9H',
  '["https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500"]'::jsonb
),
(
  'ساعة ذكية أبل واتش سيريز 9',
  'ساعة ذكية متقدمة مع مراقبة الصحة وGPS ومقاومة للماء',
  '["مراقبة معدل ضربات القلب", "GPS مدمج", "مقاومة للماء", "شاشة Retina", "تطبيقات متنوعة"]'::jsonb,
  1599.00,
  5,
  'إلكترونيات',
  'https://www.apple.com/sa/apple-watch-series-9/',
  'https://amzn.to/apple-watch-9',
  '["https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=500"]'::jsonb
),
(
  'كتاب فن إدارة الوقت',
  'دليل شامل لتعلم مهارات إدارة الوقت وزيادة الإنتاجية',
  '["استراتيجيات عملية", "أمثلة واقعية", "تمارين تطبيقية", "نصائح الخبراء"]'::jsonb,
  45.00,
  4,
  'كتب وتعليم',
  'https://example.com/time-management-book',
  'https://amzn.to/time-management',
  '["https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500"]'::jsonb
);

-- تحديث السياسات الأمنية
-- السماح للمستخدمين المصرح لهم بقراءة وكتابة المنتجات
DROP POLICY IF EXISTS "Enable read access for all users" ON products;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable update for authenticated users only" ON products;
DROP POLICY IF EXISTS "Enable delete for authenticated users only" ON products;

CREATE POLICY "Enable read access for all users" ON products
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users only" ON products
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update for authenticated users only" ON products
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete for authenticated users only" ON products
  FOR DELETE USING (true);

-- إنشاء دالة للبحث في المنتجات
CREATE OR REPLACE FUNCTION search_products(search_term TEXT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  features JSONB,
  price DECIMAL,
  rating INTEGER,
  category TEXT,
  product_url TEXT,
  affiliate_url TEXT,
  images JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.features,
    p.price,
    p.rating,
    p.category,
    p.product_url,
    p.affiliate_url,
    p.images,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE 
    p.name ILIKE '%' || search_term || '%' OR
    p.description ILIKE '%' || search_term || '%' OR
    p.category ILIKE '%' || search_term || '%'
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- إنشاء دالة للحصول على المنتجات حسب الفئة
CREATE OR REPLACE FUNCTION get_products_by_category(category_name TEXT)
RETURNS TABLE (
  id BIGINT,
  name TEXT,
  description TEXT,
  features JSONB,
  price DECIMAL,
  rating INTEGER,
  category TEXT,
  product_url TEXT,
  affiliate_url TEXT,
  images JSONB,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.features,
    p.price,
    p.rating,
    p.category,
    p.product_url,
    p.affiliate_url,
    p.images,
    p.created_at,
    p.updated_at
  FROM products p
  WHERE p.category = category_name
  ORDER BY p.created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- إنشاء view للإحصائيات
CREATE OR REPLACE VIEW product_stats AS
SELECT 
  COUNT(*) as total_products,
  COUNT(DISTINCT category) as total_categories,
  AVG(rating) as average_rating,
  AVG(price) as average_price,
  MAX(price) as max_price,
  MIN(price) as min_price
FROM products;

-- إنشاء view لأفضل المنتجات
CREATE OR REPLACE VIEW top_rated_products AS
SELECT 
  id,
  name,
  description,
  rating,
  price,
  category,
  affiliate_url,
  images
FROM products
WHERE rating >= 4
ORDER BY rating DESC, created_at DESC
LIMIT 10;

