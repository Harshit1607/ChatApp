import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import { connectDb } from './Database/db.js';
import { corsMiddleware } from './Middlewares/CorsMiddlewares.js'
import userRoutes from './Routes/userRoutes.js'
import homeRoutes from './Routes/homeRoutes.js'

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.use(corsMiddleware); // Use the CORS middleware

app.options('*', corsMiddleware); // Handle preflight requests for all routes

connectDb();

app.use('/', homeRoutes)
app.use('/user', userRoutes)

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

export default app;