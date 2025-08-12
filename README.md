# 🛍️ صفقاتي - لوحة التحكم الاحترافية

لوحة تحكم احترافية لإدارة المنتجات وروابط التسويق بالعمولة مع تكامل Supabase.

## ✨ المميزات

- 🔐 **نظام مصادقة متقدم** مع مستويات صلاحيات
- 🛍️ **إدارة المنتجات الكاملة** (إضافة، تعديل، حذف، بحث)
- 📊 **لوحة إحصائيات تفاعلية** مع بيانات حية
- 🔗 **تتبع روابط الأفيليت** مع إحصائيات النقرات
- 📱 **تصميم متجاوب** يعمل على جميع الأجهزة
- 🎨 **واجهة عصرية** مع Tailwind CSS
- ☁️ **قاعدة بيانات سحابية** مع Supabase
- 🚀 **نشر سهل** على Vercel

## 🛠️ التقنيات المستخدمة

- **Frontend:** Next.js 15 + React 19
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Deployment:** Vercel
- **Language:** TypeScript/JavaScript

## 🚀 البدء السريع

### 1. استنساخ المشروع
\`\`\`bash
git clone <repository-url>
cd safgati-new
\`\`\`

### 2. تثبيت التبعيات
\`\`\`bash
pnpm install
# أو
npm install
\`\`\`

### 3. إعداد متغيرات البيئة
انسخ ملف \`.env.example\` إلى \`.env.local\` وقم بتحديث القيم:

\`\`\`bash
cp .env.example .env.local
\`\`\`

قم بتحديث القيم التالية في \`.env.local\`:
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
\`\`\`

### 4. إعداد قاعدة البيانات
1. أنشئ مشروع جديد في [Supabase](https://supabase.com)
2. انسخ محتوى ملف \`supabase-setup.sql\` وقم بتشغيله في SQL Editor
3. احصل على URL و Anon Key من إعدادات المشروع

### 5. تشغيل المشروع محلياً
\`\`\`bash
pnpm dev
# أو
npm run dev
\`\`\`

افتح [http://localhost:3000](http://localhost:3000) في المتصفح.

## 🌐 النشر على Vercel

### النشر التلقائي
1. ادفع الكود إلى GitHub
2. اربط المستودع بـ Vercel
3. أضف متغيرات البيئة في إعدادات Vercel
4. سيتم النشر تلقائياً

### النشر اليدوي
\`\`\`bash
# تثبيت Vercel CLI
npm i -g vercel

# النشر
vercel --prod
\`\`\`

## 🔧 إعداد بيئات متعددة

### بيئة Staging
1. أنشئ مشروع Supabase منفصل للـ staging
2. أضف متغيرات البيئة في Vercel:
   - \`NEXT_PUBLIC_SUPABASE_URL\`
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
   - \`NEXT_PUBLIC_ENVIRONMENT=staging\`

### Preview Deployments
Vercel ينشئ preview deployments تلقائياً لكل pull request.

## 👥 بيانات الدخول الافتراضية

### المدير
- **البريد الإلكتروني:** admin@safgati.com
- **كلمة المرور:** admin123

### المحرر
- **البريد الإلكتروني:** editor@safgati.com
- **كلمة المرور:** editor123

## 📁 هيكل المشروع

\`\`\`
safgati-new/
├── src/
│   ├── components/          # مكونات React
│   │   ├── Dashboard.jsx    # لوحة المعلومات
│   │   ├── ProductsManager.jsx # إدارة المنتجات
│   │   ├── LoginForm.jsx    # نموذج تسجيل الدخول
│   │   └── Sidebar.jsx      # الشريط الجانبي
│   ├── contexts/           # React Contexts
│   │   └── AuthContext.jsx # إدارة المصادقة
│   ├── lib/               # مكتبات مساعدة
│   │   ├── supabase.js    # إعداد Supabase
│   │   └── database-supabase.js # طبقة قاعدة البيانات
│   └── App.jsx            # المكون الرئيسي
├── public/                # الملفات العامة
├── supabase-setup.sql     # إعداد قاعدة البيانات
├── .env.example          # مثال متغيرات البيئة
└── README.md             # هذا الملف
\`\`\`

## 🔒 الأمان

- ✅ Row Level Security (RLS) مفعل
- ✅ مصادقة المستخدمين مطلوبة للكتابة
- ✅ تشفير البيانات الحساسة
- ✅ حماية من SQL Injection
- ✅ CORS محدود

## 📊 المراقبة والتحليلات

- تتبع النقرات على روابط الأفيليت
- إحصائيات الاستخدام
- مراقبة الأداء
- تقارير المبيعات

## 🤝 المساهمة

1. Fork المشروع
2. أنشئ branch للميزة الجديدة (\`git checkout -b feature/AmazingFeature\`)
3. Commit التغييرات (\`git commit -m 'Add some AmazingFeature'\`)
4. Push إلى Branch (\`git push origin feature/AmazingFeature\`)
5. افتح Pull Request

## 📝 الترخيص

هذا المشروع مرخص تحت رخصة MIT - انظر ملف [LICENSE](LICENSE) للتفاصيل.

## 📞 الدعم

إذا واجهت أي مشاكل أو لديك أسئلة:

- 📧 البريد الإلكتروني: support@safgati.com
- 🐛 تقرير الأخطاء: [GitHub Issues](https://github.com/your-repo/issues)
- 📖 الوثائق: [Wiki](https://github.com/your-repo/wiki)

---

صنع بـ ❤️ لمجتمع التسويق بالعمولة العربي

# Safgati Admin Panel - Deployed!
