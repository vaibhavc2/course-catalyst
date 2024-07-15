import healthRouter from '#/api/v1/routes/health.routes';
import userRouter from '#/api/v1/routes/user.routes';
import { Router } from 'express';

// Create a new router instance
const apiV1Router = Router();

apiV1Router.use('/health', healthRouter);

apiV1Router.use('/users', userRouter);

// Export the router
export default apiV1Router;
