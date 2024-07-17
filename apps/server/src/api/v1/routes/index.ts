import healthRouter from '#/api/v1/routes/health.routes';
import userRouter from '#/api/v1/routes/user.routes';
import avatarRouter from '#/api/v1/routes/avatar.routes';
import express from 'express';

// Create a new router instance
const apiV1Router = express.Router();

apiV1Router.use('/health', healthRouter);

apiV1Router.use('/users', userRouter);

apiV1Router.use('/avatars', avatarRouter);

// Export the router
export default apiV1Router;
