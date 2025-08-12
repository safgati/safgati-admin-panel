import { createClient } from '@supabase/supabase-js'

// إعدادات Supabase للبيئة الحالية
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY'

// إنشاء عميل Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// دالة للتحقق من حالة الاتصال
export const checkConnection = async () => {
  try {
    const { data, error } = await supabase.from('products').select('count', { count: 'exact', head: true })
    if (error) throw error
    return { connected: true, message: 'متصل بقاعدة البيانات' }
  } catch (error) {
    console.error('خطأ في الاتصال بقاعدة البيانات:', error)
    return { connected: false, message: error.message }
  }
}

// دالة لتسجيل النقرات
export const trackClick = async (productId, userInfo = {}) => {
  try {
    const { data, error } = await supabase
      .from('click_tracking')
      .insert([
        {
          product_id: productId,
          user_ip: userInfo.ip || null,
          user_agent: userInfo.userAgent || navigator.userAgent,
          referrer: userInfo.referrer || document.referrer,
        }
      ])
    
    if (error) throw error
    return { success: true, data }
  } catch (error) {
    console.error('خطأ في تسجيل النقرة:', error)
    return { success: false, error: error.message }
  }
}

