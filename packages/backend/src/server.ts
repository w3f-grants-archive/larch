import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import express, {
  Request, Response, NextFunction, Application,
} from 'express';
import createHttpError from 'http-errors';
import cors from 'cors';
import apiRouter from './api/index.js';

export type ServiceStartOptions = {
  httpPort: string | number,
  disableUi: boolean,
  disableApi: boolean
};

export const startService = (serviceStartOptions: ServiceStartOptions) => {
  const app: Application = express();

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  app.use('/healthz', (req: Request, res: Response) => {
    res.status(200).json({ message: 'Larch service is healthy' });
  });
  if (serviceStartOptions.disableUi !== true) {
    console.log('ui enabled');
    app.get('/', (req, res) => res.redirect('/ui'));
    app.use('/ui', express.static(join(dirname(fileURLToPath(import.meta.url)), 'ui')));
    app.get('/ui/*', (req, res) => {
      res.sendFile(join(dirname(fileURLToPath(import.meta.url)), 'ui/index.html'));
    });
  }
  if (serviceStartOptions.disableApi !== true) {
    console.log('api enabled');
    app.use('/api', apiRouter);
  }

  app.use((req: Request, res: Response, next: NextFunction) => {
    next(new createHttpError.NotFound());
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    res.status(500);
    res.send({
      status: 500,
      message: err.message,
    });
  });

  const httpPort: Number = Number(serviceStartOptions.httpPort) || 9000;

  app.listen(httpPort, () => {
    console.log(`app is listening on port ${httpPort}`);
  });
  return app;
};
