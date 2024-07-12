import healthRouter from '#/api/v1/health/health.routes';
import userRouter from '#/api/v1/users/users.routes';
import { routePrefix } from '#/utils/route-prefix.util';
import express, { Router } from 'express';

// Create a new router instance
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRouter);

apiV1Router.use('/users', userRouter);

// Export the router
export default apiV1Router;
