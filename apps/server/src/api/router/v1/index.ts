import healthRouter from '@/api/router/v1/routes/health.routes';
import express from 'express';

// Create a new router instance
const apiV1Router = express.Router();

/**
 * Routes for API v1
 * @swagger
 * tags:
 *  name: API v1
 *  description: API v1 routes
 *  */

// app health check
apiV1Router.use('/health', healthRouter);

// Export the router
export default apiV1Router;
