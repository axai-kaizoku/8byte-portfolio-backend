import portfolioController from '@/controllers/portfolio.controller';
import express from 'express';

const router = express.Router();
router.route('/').get(portfolioController.getPortflio);
router.route('/:symbol').get(portfolioController.refreshStockPrice);

export default router;
