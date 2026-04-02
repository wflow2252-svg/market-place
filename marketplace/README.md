# LuxeBrands Marketplace 🛍️

منصة متكاملة للماركات الفاخرة — React + Express + Prisma + Supabase + Vercel

---

## 🗂️ هيكل المشروع

```
marketplace/
├── api/
│   └── index.js              ← Vercel Serverless Function
├── backend/
│   ├── prisma/
│   │   └── schema.prisma     ← Database Schema
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   └── userController.js
│   │   ├── middlewares/
│   │   │   └── authMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   └── userRoutes.js
│   │   └── utils/
│   │       ├── db.js
│   │       ├── generateToken.js
│   │       └── sendEmail.js
│   ├── server.js             ← Local Dev Server
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   ├── components/
│   │   ├── context/
│   │   └── utils/
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json              ← Root (runs both)
├── vercel.json               ← Vercel Config
├── .gitignore
└── start_project.bat         ← Windows Quick Start
```

---

## ⚡ التشغيل المحلي (أول مرة)

### 1. إعداد قاعدة البيانات (Supabase)

1. روح [supabase.com](https://supabase.com) وأنشئ مشروع جديد
2. روح **Settings → Database → Connection String**
3. انسخ **Transaction pooler** (Port 6543) → ده الـ `DATABASE_URL`
4. انسخ **Direct connection** (Port 5432) → ده الـ `DIRECT_URL`

### 2. إنشاء ملف `.env` في مجلد `backend`

```bash
cp backend/.env.example backend/.env
```

ثم عدّل الملف:
```env
DATABASE_URL="postgresql://postgres.XXXX:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.XXXX:PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
JWT_SECRET=LuxeBrandsSecureSecretKey2026_Hazem
NODE_ENV=development
PORT=5000
```

### 3. تهيئة قاعدة البيانات

```bash
cd backend
npx prisma generate
npx prisma db push
```

### 4. تشغيل المشروع

**Windows:** دبل كليك على `start_project.bat`

**أو من الـ terminal:**
```bash
npm run install:all
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- Health Check: http://localhost:5000/v1/health

---

## 🚀 النشر على Vercel

### 1. إضافة Environment Variables في Vercel Dashboard

روح مشروعك على Vercel → **Settings → Environment Variables** وأضف:

| Key | Value |
|-----|-------|
| `DATABASE_URL` | `postgresql://...?pgbouncer=true` |
| `DIRECT_URL` | `postgresql://...` (بدون pgbouncer) |
| `JWT_SECRET` | مفتاحك السري |
| `NODE_ENV` | `production` |
| `FRONTEND_URL` | رابط الفرونت على Vercel |

### 2. Deploy

```bash
vercel --prod
```

أو عن طريق GitHub push إذا ربطت الـ repo.

---

## 🔌 API Endpoints

### Auth
| Method | URL | Description |
|--------|-----|-------------|
| POST | `/v1/auth/register` | تسجيل مستخدم جديد |
| POST | `/v1/auth/login` | تسجيل الدخول |
| GET | `/v1/auth/profile` | جلب بيانات المستخدم (Protected) |

### Products
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/v1/products` | جلب المنتجات (مع فلتر وبحث) |
| POST | `/v1/products` | إضافة منتج (Admin فقط) |

### Users (Admin)
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/v1/users` | جلب كل المستخدمين |
| POST | `/v1/users/brand` | إنشاء حساب براند |

### Health
| Method | URL | Description |
|--------|-----|-------------|
| GET | `/v1/health` | فحص حالة الـ API والـ DB |

---

## 🛡️ الأدوار (Roles)

- `USER` — مستخدم عادي (التسجيل الافتراضي)
- `BRAND` — براند (يُنشئه الـ Admin فقط)
- `ADMIN` — مدير النظام (يُعيَّن يدوياً في DB)

لإنشاء أول Admin، شغّل في Supabase SQL Editor:
```sql
UPDATE "User" SET role = 'ADMIN' WHERE email = 'your@email.com';
```

---

## 🔧 حل المشاكل الشائعة

### ❌ `FATAL: Tenant or user not found`
الـ DATABASE_URL غلط. تأكد من نسخه من Supabase Dashboard مباشرة.

### ❌ `PrismaClientConstructorValidationError`
شغّل `npx prisma generate` من داخل مجلد `backend`.

### ❌ CORS Error في Vercel
أضف رابط الفرونت في `api/index.js` في مصفوفة `origin`.
