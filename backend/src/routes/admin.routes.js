import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { rejectSchema } from '../schemas/listing.schemas.js';
import { createUnionSchema, updateUnionSchema } from '../schemas/union.schemas.js';
import { createUserByAdminSchema, updateUserByAdminSchema } from '../schemas/user.schemas.js';
import {
  stats,
  pendingListings,
  approveListing,
  rejectListing,
  pendingUsers,
  approveUser,
  rejectUser,
  listAllUnions,
  createUnion,
  updateUnion,
  deleteUnion,
  listAllUsers,
  getUser,
  createUserByAdmin,
  updateUserByAdmin,
  deleteUserByAdmin,
} from '../controllers/admin.controller.js';

const router = Router();

// Toda la zona admin requiere estar autenticado.
router.use(authMiddleware);

// Stats: cualquiera con poderes administrativos
router.get('/stats', requirePermission('canModerate', 'canManageUsers'), stats);

// Moderación de publicaciones → canModerate
router.get('/listings/pending', requirePermission('canModerate'), pendingListings);
router.put('/listings/:id/approve', requirePermission('canModerate'), approveListing);
router.put(
  '/listings/:id/reject',
  requirePermission('canModerate'),
  validate(rejectSchema),
  rejectListing
);

// Gestión de usuarios → canManageUsers
router.get('/users', requirePermission('canManageUsers'), listAllUsers);
router.get('/users/pending', requirePermission('canManageUsers'), pendingUsers);
router.get('/users/:id', requirePermission('canManageUsers'), getUser);
router.post(
  '/users',
  requirePermission('canManageUsers'),
  validate(createUserByAdminSchema),
  createUserByAdmin
);
router.put(
  '/users/:id',
  requirePermission('canManageUsers'),
  validate(updateUserByAdminSchema),
  updateUserByAdmin
);
router.delete('/users/:id', requirePermission('canManageUsers'), deleteUserByAdmin);
router.put('/users/:id/approve', requirePermission('canManageUsers'), approveUser);
router.put(
  '/users/:id/reject',
  requirePermission('canManageUsers'),
  validate(rejectSchema),
  rejectUser
);

// Sindicatos: solo ADMIN puro
router.get('/unions', adminMiddleware, listAllUnions);
router.post('/unions', adminMiddleware, validate(createUnionSchema), createUnion);
router.put('/unions/:id', adminMiddleware, validate(updateUnionSchema), updateUnion);
router.delete('/unions/:id', adminMiddleware, deleteUnion);

export default router;
