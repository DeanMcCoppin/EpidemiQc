import { Router } from 'express';
import { getPreferences, createPreference, updatePreference, deletePreference } from '../controllers/preference.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// All preference routes require authentication
router.use(authMiddleware);

router.get('/', getPreferences);
router.post('/', createPreference);
router.put('/:id', updatePreference);
router.delete('/:id', deletePreference);

export default router;
