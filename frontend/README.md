# DocenMarket — Frontend

Interfaz web de DocenMarket: React 18 + Vite + Tailwind CSS.

## Arranque rápido

```bash
cp .env.example .env
npm install
npm run dev
```

La app corre en `http://localhost:5173` y hace proxy de `/api` al backend en `http://localhost:3001`.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo Vite |
| `npm run build` | Build de producción |
| `npm run preview` | Preview del build |

## Estructura

```
src/
├── api/              # Cliente axios + módulos por dominio
├── components/
│   ├── layout/       # AppLayout, Sidebar, Topbar
│   └── ui/           # ListingCard, FilterBar, Spinner, EmptyState
├── context/          # AuthContext (JWT + login/logout)
├── pages/
│   ├── admin/        # Dashboard, PendingListings, PendingUsers
│   ├── Home.jsx
│   ├── Marketplace.jsx
│   ├── Bolsa.jsx
│   ├── Emprendimientos.jsx
│   ├── Publish.jsx
│   ├── Unions.jsx
│   ├── Login.jsx
│   ├── Register.jsx
│   └── Placeholders.jsx
└── styles/
    └── globals.css   # Tailwind + clases utilitarias (.btn, .input, .card, .badge…)
```

## Rutas

| Ruta | Acceso | Descripción |
|------|--------|-------------|
| `/login` | Público | Iniciar sesión |
| `/register` | Público | Registro en 3 pasos |
| `/` | Usuario | Inicio |
| `/marketplace` | Usuario | Marketplace con filtros |
| `/bolsa` | Usuario | Bolsa de trabajo |
| `/emprendimientos` | Usuario | Emprendimientos docentes |
| `/publicar` | Usuario | Crear publicación |
| `/sindicatos` | Usuario | Red de sindicatos |
| `/mensajes` | Usuario | Próximamente |
| `/perfil` | Usuario | Datos personales |
| `/pagos` | Usuario | Próximamente |
| `/admin` | Admin | Dashboard con métricas |
| `/admin/publicaciones` | Admin | Aprobar/rechazar publicaciones |
| `/admin/usuarios` | Admin | Verificar afiliados pendientes |
