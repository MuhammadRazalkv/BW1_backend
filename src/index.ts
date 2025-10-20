import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import connectDB from './config/db';
import userRoute from './routes/user.routes';
import errorHandler from './middlewares/error.middleware';

const app = express();
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use('/users', userRoute);
app.use(errorHandler)
connectDB().then(() => {
  app.listen(3000, () => {
    console.log('Server running on port 3000');
  });
});
