import { Router } from 'express';
import { getRegions, getRegionById, getRegionTrends } from '../controllers/region.controller';

const router = Router();

router.get('/', getRegions);
router.get('/:id', getRegionById);
router.get('/:id/trends', getRegionTrends);

export default router;
