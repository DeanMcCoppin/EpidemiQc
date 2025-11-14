import { Router } from 'express';
import { getHospitals, getHospitalById } from '../controllers/hospital.controller';

const router = Router();

// Public routes
router.get('/', getHospitals);
router.get('/:id', getHospitalById);

export default router;
