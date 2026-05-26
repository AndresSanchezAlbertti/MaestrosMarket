import { Router } from 'express';
import { list, create } from '../controllers/unions.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { adminMiddleware } from '../middleware/admin.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { createUnionSchema } from '../schemas/union.schemas.js';

const router = Router();

router.get('/', list);
router.post('/', authMiddleware, adminMiddleware, validate(createUnionSchema), create);

export default router;
