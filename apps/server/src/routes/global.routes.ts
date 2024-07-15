import apiV1Router from '#/api/v1/routes';
import { Router } from 'express';

const apiRouter = Router();

apiRouter.use('/api/v1', apiV1Router);
// ... add more routers versions here ...

export default apiRouter;
