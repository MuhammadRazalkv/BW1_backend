import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import userRoute from './routes/user.routes';
import errorHandler from './middlewares/error.middleware';
import articleRoute from './routes/article.route';
import { rateLimit } from 'express-rate-limit';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

const limiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 15 minutes
  limit: 50, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
  standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
});


app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(limiter);

app.use('/users', userRoute);
app.use('/articles', articleRoute);
app.use(errorHandler);
connectDB().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
