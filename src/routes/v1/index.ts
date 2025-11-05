import express from 'express';
import portfolioRoute from './portfolio.route';

const router = express.Router();

const defaultRoutes = [
  {
    path: '/portfolio',
    route: portfolioRoute,
  },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

export default router;
