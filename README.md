# DocenMarket

Plataforma de intercambio para la comunidad docente: marketplace, bolsa de trabajo, emprendimientos y red de sindicatos, con verificación manual de afiliados y moderación de publicaciones.

Este repositorio contiene dos proyectos independientes:

- `backend/` — API REST en Node.js + Express + Prisma + PostgreSQL.
- `frontend/` — SPA en React 18 + Vite + Tailwind CSS.

---

## Levantar el proyecto de cero

### 1. Requisitos

- Node.js 18+
- npm 9+
- Docker (recomendado) o PostgreSQL 14+ instalado localmente

### 2. Base de datos (con Docker)

Desde la raíz del repo:

```bash
docker compose up -d
```

Esto levanta un PostgreSQL en `localhost:5432` con:

- usuario: `docenmarket`
- contraseña: `docenmarket`
- base de datos: `docenmarket`

Si preferís usar tu PostgreSQL local, simplemente ajustá la variable `DATABASE_URL` del backend.

### 3. Backend

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

El backend queda escuchando en `http://localhost:3001`.

El script `npm run seed` crea:

- un usuario admin (`admin@docenmarket.com` / `admin123`)
- sindicatos argentinos de ejemplo (CTERA, SUTEBA, UTE, AMSAFE, UEPC, etc.)

### 4. Frontend

En otra terminal:

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

La app queda disponible en `http://localhost:5173`.

---

## Credenciales de prueba

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@docenmarket.com` | `admin123` |

Podés crear nuevos usuarios desde `/register`. Quedan en estado `PENDING_VERIFICATION` hasta que el admin los apruebe desde `/admin/usuarios`.

---

## Flujos principales

**Registro de docentes**

1. El docente se registra desde `/register` (3 pasos: sindicato → datos personales → contraseña).
2. La cuenta queda en `PENDING_VERIFICATION`.
3. El admin verifica el número de afiliado desde `/admin/usuarios`.
4. El docente recibe un email con el resultado (en desarrollo se loguea por consola).
5. Si fue aprobado, puede iniciar sesión.

**Publicaciones**

1. Un docente verificado publica desde `/publicar` → la publicación queda `PENDING`.
2. El admin la aprueba o rechaza desde `/admin/publicaciones`.
3. Si fue aprobada → aparece en `/marketplace`, `/bolsa` o `/emprendimientos` según su tipo.
4. Si fue rechazada → el docente recibe un email con el motivo.

---

## Estructura del repo

```
.
├── backend/         # API REST (Node + Express + Prisma)
├── frontend/        # SPA (React + Vite + Tailwind)
├── docker-compose.yml
└── README.md
```

Cada proyecto tiene su propio README con detalles técnicos.
