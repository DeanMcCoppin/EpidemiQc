import { Router } from 'express';
import { getCurrentOutbreaks, getMapData } from '../controllers/outbreak.controller';

const router = Router();

router.get('/current', getCurrentOutbreaks);
router.get('/map-data', getMapData);

export default router;
