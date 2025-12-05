import { Router } from 'express';
import { getHospitals, getHospitalById, getHospitalTestResults } from '../controllers/hospital.controller';

const router = Router();

// Public routes
router.get('/', getHospitals);
router.get('/:id/test-results', getHospitalTestResults);
router.get('/:id', getHospitalById);

export default router;
