import { Router } from 'express';
import apiV1Router from './v1.router';

const apiRouter = Router();

apiRouter.use('/api/v1', apiV1Router);
// ... add more routers versions here ...

export default apiRouter;
