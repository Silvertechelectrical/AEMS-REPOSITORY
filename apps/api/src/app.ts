import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { config } from 'dotenv';
import { apiRouter } from './routes/index.js';

config();

const app = express();
const allowedOrigins = [process.env.WEB_URL, 'http://localhost:3000', 'http://127.0.0.1:3000']
  .filter((origin): origin is string => Boolean(origin));

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.use('/api/v1', apiRouter);

export default app;
