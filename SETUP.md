# CRONIA — Setup

## 1. Dependencias
```bash
cd cronia
npm install
```

## 2. Variables de entorno
Copia `.env.example` a `.env.local` y llena los valores:

```bash
cp .env.example .env.local
```

Necesitas:
- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` → tu proyecto de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` → Settings > API en Supabase
- `RESEND_API_KEY` → resend.com (plan gratuito funciona)
- `NEXT_PUBLIC_APP_URL` → `http://localhost:3000` en dev, `https://app.cronia.mx` en prod
- `CRON_SECRET` → cualquier string aleatorio seguro

## 3. Base de datos
Ve al SQL Editor de tu proyecto Supabase y ejecuta el archivo:
```
supabase/schema.sql
```

## 4. Crear tu cuenta de admin
1. Corre el proyecto: `npm run dev`
2. Ve a `http://localhost:3000/register?token=SKIP` — esto no funciona
3. En su lugar, ve directo a Supabase > Authentication > Add user
4. Crea tu usuario con tu correo
5. En el SQL Editor ejecuta:
```sql
UPDATE profiles SET role = 'admin' WHERE email = 'hola@cronia.mx';
```

## 5. Correr en desarrollo
```bash
npm run dev
```

## 6. Logo
Coloca el logo en `public/logo.png` (fondo blanco) o `public/logo-white.png` (fondo transparente/blanco invertido para fondo oscuro).

## 7. Deploy en Vercel
- Conecta el repo a Vercel
- Configura las mismas env vars en Vercel
- Asigna el dominio `app.cronia.mx`
- El cron de check-in corre automáticamente cada viernes a las 2pm UTC

## Flujo de trabajo semanal
1. Tienes una sesión con un cliente
2. Entras a `/admin/clients/[id]`
3. Subes: accionables de la semana, insight, session agendada, playbooks nuevos
4. Cada viernes el sistema envía reminder automático por correo
5. El cliente llena su check-in → las métricas se actualizan automáticamente
