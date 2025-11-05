import portfolioController from '@/controllers/portfolio.controller';
import express from 'express';

const router = express.Router();
router.route('/').get(portfolioController.getPortflio);

export default router;
