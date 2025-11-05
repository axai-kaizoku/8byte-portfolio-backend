import 'express-async-errors';
import { corsOptions, env } from '@/config';
import morgan from '@/config/morgan';
import { errorConverter, errorHandler } from '@/middlewares/error';
import routes from '@/routes/v1';
import { ApiError } from '@/utils';
import compression from 'compression';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import httpStatus from 'http-status';

const app = express();

if (env.mode !== 'test') {
  app.use(morgan.successHandler);
  app.use(morgan.errorHandler);
}

// set security HTTP headers
app.use(helmet());

// parse json request body
app.use(express.json());

// parse urlencoded request body
app.use(express.urlencoded({ extended: true }));

// gzip compression
app.use(compression());

// enable cors
app.use(cors(corsOptions));

// v1 api routes
app.use('/api', routes);

// send back a 404 error for any unknown api request
app.use((_req, _res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, 'No Endpoint found'));
});

// convert error to ApiError, if needed
app.use(errorConverter);

app.use(errorHandler);

export default app;
