import cors from 'cors';

const corsOptions = {
  origin: ['http://localhost:3000'], // This is correct - no trailing slash
  methods: 'GET, POST, PUT, PATCH, DELETE, OPTIONS', // This allows all the necessary HTTP methods
  allowedHeaders: 'Content-Type, Authorization', // Allow headers for content type and authorization tokens
  credentials: true // Allow cookies or authorization headers if needed
};


// Create and export CORS middleware
const corsMiddleware = cors(corsOptions);

export { corsMiddleware, corsOptions };