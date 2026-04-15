# FinanTrack 360 💰

App de finanzas personales construida con HTML vanilla + Supabase + Vercel.

## Estructura del Proyecto

```
finantrack360/
├── index.html            ← Login / Registro
├── dashboard.html        ← Pantalla principal
├── add-transaction.html  ← Agregar transacción
├── goals.html            ← Objetivos financieros
├── budgets.html          ← Presupuesto mensual
├── settings.html         ← Configuración
├── supabase.js           ← Cliente + helpers de Supabase
├── supabase-schema.sql   ← Schema de base de datos
└── README.md
```

---

## 🚀 Configuración paso a paso

### 1. Crear proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto (guarda la contraseña de la DB)
3. Espera ~2 minutos a que el proyecto arranque

### 2. Ejecutar el Schema SQL

1. En Supabase → **SQL Editor** → **New query**
2. Pega el contenido de `supabase-schema.sql`
3. Haz clic en **Run** ▶️
4. Verás las tablas creadas en **Table Editor**

### 3. Obtener tus credenciales

1. En Supabase → **Settings** → **API**
2. Copia:
   - **Project URL** → `https://xxxxxxxx.supabase.co`
   - **anon public key** → la clave larga que empieza con `eyJ...`

### 4. Configurar credenciales en el código

Abre `supabase.js` y reemplaza las líneas al inicio:

```javascript
const SUPABASE_URL = 'https://TU_PROJECT_ID.supabase.co';  // ← tu URL
const SUPABASE_ANON_KEY = 'TU_ANON_KEY';                   // ← tu clave
```

### 5. (Opcional) Habilitar login con Google

1. Supabase → **Authentication** → **Providers** → **Google**
2. Activa Google y configura OAuth en Google Cloud Console
3. Agrega la URL de callback de Supabase en Google

---

## 📦 Subir a GitHub

```bash
# Desde la carpeta del proyecto
git init
git add .
git commit -m "Initial commit - FinanTrack 360"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/finantrack360.git
git push -u origin main
```

---

## ▲ Desplegar en Vercel

### Opción A — Desde Vercel Dashboard (más fácil)
1. Ve a [vercel.com](https://vercel.com) y conecta tu cuenta de GitHub
2. Clic en **New Project** → importa tu repo `finantrack360`
3. Framework Preset: **Other**
4. Clic en **Deploy** ✅

### Opción B — Con CLI
```bash
npm i -g vercel
vercel login
vercel --prod
```

### ⚠️ Configurar dominio en Supabase
Después de hacer deploy, ve a:
**Supabase → Authentication → URL Configuration**

Agrega tu dominio de Vercel:
- Site URL: `https://tu-app.vercel.app`
- Redirect URLs: `https://tu-app.vercel.app/dashboard.html`

---

## 🔒 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Cada usuario solo puede ver y modificar sus propios datos
- Las claves de Supabase en el frontend son seguras (son públicas por diseño)
- **NUNCA** uses la `service_role` key en el frontend

---

## 🗄️ Tablas de la base de datos

| Tabla | Descripción |
|-------|-------------|
| `profiles` | Perfil de cada usuario |
| `transactions` | Ingresos y gastos |
| `categories` | Categorías (default + personalizadas) |
| `goals` | Objetivos financieros |
| `budgets` | Presupuestos mensuales por categoría |

---

## 🛠️ Tecnologías

- **Frontend**: HTML5 + CSS3 + JavaScript vanilla
- **Auth & DB**: Supabase (PostgreSQL + GoTrue Auth)
- **Hosting**: Vercel
- **Fuentes**: DM Serif Display + DM Sans (Google Fonts)
