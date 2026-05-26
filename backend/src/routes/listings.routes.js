import { Router } from 'express';
import {
  list,
  detail,
  create,
  update,
} from '../controllers/listings.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { optionalAuth } from '../middleware/optionalAuth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { requirePermission } from '../middleware/permission.middleware.js';
import {
  createListingSchema,
  updateListingSchema,
} from '../schemas/listing.schemas.js';

const router = Router();

// Listado y detalle: auth opcional (anónimos solo ven APPROVED + NETWORK)
router.get('/', optionalAuth, list);
router.get('/:id', optionalAuth, detail);

router.post(
  '/',
  authMiddleware,
  requirePermission('canPublish'),
  validate(createListingSchema),
  create
);
router.put(
  '/:id',
  authMiddleware,
  requirePermission('canPublish'),
  validate(updateListingSchema),
  update
);

export default router;
