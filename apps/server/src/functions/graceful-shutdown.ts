import { IncomingMessage, Server, ServerResponse } from 'http';

// Graceful shutdown in case of SIGINT (Ctrl+C) or SIGTERM (Docker)
export const gracefulShutdown = (
  server: Server<typeof IncomingMessage, typeof ServerResponse>,
  waitTime: number = 5000, // Default wait time of 5 seconds
) => {
  console.debug('\n=> Signal received: closing HTTP server...');

  // Stop accepting new connections
  server.close(() => {
    console.debug('HTTP server closed gracefully.');
  });

  // Wait for ongoing requests to finish with a timeout
  setTimeout(() => {
    console.debug(
      `Waiting for ${waitTime / 1000} seconds for ongoing requests to complete...`,
    );
    // Optionally, forcefully terminate remaining connections here
  }, waitTime);
};
