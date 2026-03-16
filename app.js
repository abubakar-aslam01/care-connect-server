import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

import { corsOptions } from './config/corsOptions.js';
import routes from './routes/index.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';

// Load environment variables once for any runtime (serverless or server)
dotenv.config();

const app = express();

// Trust proxy headers (important for rate limiting & secure cookies when behind reverse proxies)
app.set('trust proxy', 1);

// Core security & parsing middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(mongoSanitize());
app.use(xss());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(apiLimiter);
app.use('/uploads', express.static(path.join(process.cwd(), 'server', 'uploads')));

// Logging (can be silenced in production with env var)
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Routes
app.use('/api', routes);

// Health root
app.get('/', (req, res) => {
  res.status(200).json({ success: true, message: 'API is running' });
});

// Error handling
app.use(notFound);
app.use(errorHandler);

export default app;
