import { createClient } from '@supabase/supabase-js'

// إعدادات Supabase للبيئة الحالية (Vite)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://tqugfevrezqblqchesnt.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRxdWdmZXZyZXpxYmxxY2hlc250Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5MzY4MjMsImV4cCI6MjA3MDUxMjgyM30.a6Q_Af2PkWIJ3SxiykcwCYRasmr4USFokGi-MTSsOPE'

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

