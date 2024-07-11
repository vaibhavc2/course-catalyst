import healthRouter from '@/api/v1/health/health.routes';
import userRouter from '@/api/v1/users/users.routes';
import express from 'express';

// Create a new router instance
const apiV1Router = express.Router();

/**
 * Routes for API v1
 * @swagger
 * tags:
 * name: API v1
 * description: API v1 routes
 *  */

// app health check routes
apiV1Router.use('/health', healthRouter);

// user routes
apiV1Router.use('/users', userRouter);

// Export the router
export default apiV1Router;
