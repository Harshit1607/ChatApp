import { server } from './server.js'; // Import the server with socket setup

const port = process.env.PORT || 5000;

server.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});
