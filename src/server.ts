import express from 'express';
import { errorHandler } from './api/error-handler.ts';
import { incidentRoutes } from './api/incident-routes.ts';
import { IncidentRepository } from './repository/incident-repository.ts';
import { IncidentService } from './service/incident-service.ts';

export function createApp(): express.Express {
  const app = express();
  app.use(express.json());
  app.use(incidentRoutes(new IncidentService(new IncidentRepository())));
  app.use(errorHandler);
  return app;
}

if (import.meta.filename === process.argv[1]) {
  const port = Number(process.env.PORT ?? 3000);
  createApp().listen(port, () => console.log(`incident-tracker listening on :${port}`));
}
