# SpaBar Frontend

Frontend de **SpaBar** — sistema gestor de bar/spa con UI premium dark mode.

## Stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- TailwindCSS v4
- Axios + React Query
- React Hook Form + Zod
- Framer Motion + Recharts

## Arquitectura

```
src/
├── app/           # Rutas (App Router)
├── components/    # UI reutilizable (sin lógica de negocio)
├── hooks/         # Lógica reutilizable (React Query)
├── services/      # Cliente HTTP y llamadas API
├── context/       # Auth context
├── types/         # Tipos TypeScript
├── lib/           # Utilidades y schemas Zod
└── styles/        # Estilos globales
```

## Instalación

```bash
cp .env.local.example .env.local
# Editar NEXT_PUBLIC_API_URL

npm install
npm run dev
```

App disponible en `http://localhost:3000`

## Variables de entorno

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL base de la API (incluye `/api/v1`) |

## Vistas

| Ruta | Descripción |
|------|-------------|
| `/login` | Inicio de sesión |
| `/register` | Registro |
| `/dashboard` | Panel principal |
| `/menu` | Gestión del menú |
| `/inventario` | Control de stock |
| `/ventas` | Pedidos y reportes |
| `/mesas` | Mesas y reservas |
| `/staff` | Gestión de personal (admin) |
| `/admin` | Redirige al dashboard (solo admin) |

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Desarrollo |
| `npm run build` | Build producción |
| `npm start` | Servidor producción |
| `npm run lint` | ESLint |

## Despliegue en Vercel

1. Importar repositorio en [Vercel](https://vercel.com)
2. Framework: **Next.js**
3. Variable de entorno:
   - `NEXT_PUBLIC_API_URL` = URL del backend en Render + `/api/v1`
4. Deploy

## Protección de rutas

- `ProtectedRoute` — requiere sesión activa
- `GuestRoute` — redirige si ya hay sesión
- `RoleGuard` — restringe por rol (`admin`)

## Sesión

- JWT en `localStorage`
- Hidratación con `GET /auth/me` al cargar (sesión persiste al refrescar)
- Interceptor Axios inyecta token automáticamente
- 401 → logout + redirect a `/login`
- Refresh token automático

## Cumplimiento rúbrica (Proyecto Final Web)

| Criterio | Estado |
|----------|--------|
| Login/registro/logout + persistencia sesión | ✅ |
| 401 automático + errores en formulario | ✅ |
| Rutas privadas + rol admin + 404 | ✅ |
| Vistas CRUD + loading/vacío/error + responsive | ✅ |
| Cliente HTTP centralizado (`services/http.ts`) | ✅ |
| Arquitectura services/hooks/components/app | ✅ |
| Dark mode | ✅ (bonificación) |
