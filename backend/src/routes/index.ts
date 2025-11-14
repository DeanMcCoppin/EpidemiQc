import { Router } from 'express';
import authRoutes from './auth.routes';
import regionRoutes from './region.routes';
import conditionRoutes from './condition.routes';
import outbreakRoutes from './outbreak.routes';
import preferenceRoutes from './preference.routes';
import adminRoutes from './admin.routes';
import hospitalRoutes from './hospital.routes';

const router = Router();

// API routes
router.use('/auth', authRoutes);
router.use('/regions', regionRoutes);
router.use('/conditions', conditionRoutes);
router.use('/outbreaks', outbreakRoutes);
router.use('/preferences', preferenceRoutes);
router.use('/admin', adminRoutes);
router.use('/hospitals', hospitalRoutes);

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

export default router;
