# DocenMarket — Backend

API REST de DocenMarket construida con Node.js, Express y Prisma.

## Arranque rápido

```bash
cp .env.example .env
npm install
npx prisma migrate dev --name init
npm run seed
npm run dev
```

El backend escucha en `http://localhost:3001`.

Después del seed:
- Admin: `admin@docenmarket.com` / `admin123`
- Sindicatos cargados: CTERA, SUTEBA, UTE, AMSAFE, UEPC, AGMER, ATEN.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor en modo desarrollo con watch |
| `npm start` | Servidor en producción |
| `npm run seed` | Carga datos iniciales (admin + sindicatos) |
| `npx prisma migrate dev` | Crea/aplica migraciones |
| `npx prisma studio` | UI web para inspeccionar la DB |

## Endpoints principales

Ver lista completa en el README raíz del proyecto. Resumen:

- `POST /api/auth/register` — registro (queda PENDING)
- `POST /api/auth/login` — login (devuelve JWT)
- `GET  /api/auth/me` — usuario logueado
- `GET  /api/listings` — listado paginado con filtros
- `POST /api/listings` — crear publicación (auth)
- `GET  /api/unions` — sindicatos activos
- `GET  /api/messages/:listingId` — mensajes de una publicación
- `POST /api/messages/:listingId` — enviar mensaje
- `GET  /api/admin/stats` — métricas (solo ADMIN)
- `PUT  /api/admin/listings/:id/approve|reject`
- `PUT  /api/admin/users/:id/approve|reject`
