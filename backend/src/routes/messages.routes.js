import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { validate } from '../middleware/validate.middleware.js';
import { sendMessageSchema } from '../schemas/message.schemas.js';
import { listForListing, send } from '../controllers/messages.controller.js';

const router = Router();

router.get('/:listingId', authMiddleware, listForListing);
router.post('/:listingId', authMiddleware, validate(sendMessageSchema), send);

export default router;
