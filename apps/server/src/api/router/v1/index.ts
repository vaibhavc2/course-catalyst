import express from 'express';
// Import your controllers here
// import UsersController from './controllers/UsersController';

// Create a new router instance
const apiV1Router = express.Router();

// Define routes

// get Hello World
apiV1Router.get('/', (req, res) => {
  res.send('Hello World!');
});

// Example route for creating a new user
// apiV1Router.post('/users', UsersController.create);

// Add more routes as needed

// Export the router
export default apiV1Router;
