import { Router } from 'express';
import {
  getTestResults,
  createTestResult,
  getAnalyticsOverview,
  getThresholds,
  updateThreshold,
} from '../controllers/admin.controller';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// All admin routes require authentication and admin role
router.use(authMiddleware, adminMiddleware);

// Test results management
router.get('/test-results', getTestResults);
router.post('/test-results', createTestResult);

// Analytics
router.get('/analytics/overview', getAnalyticsOverview);

// Thresholds management
router.get('/thresholds', getThresholds);
router.put('/thresholds/:id', updateThreshold);

export default router;
