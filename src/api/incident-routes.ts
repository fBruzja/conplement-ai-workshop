import { Router } from 'express';
import type { IncidentService } from '../service/incident-service.ts';
import {
  assignIncidentSchema,
  createIncidentSchema,
  listIncidentsQuerySchema,
} from './schemas.ts';

export function incidentRoutes(service: IncidentService): Router {
  const router = Router();

  router.post('/incidents', (req, res) => {
    const command = createIncidentSchema.parse(req.body);
    res.status(201).json(service.create(command));
  });

  router.get('/incidents', (req, res) => {
    const query = listIncidentsQuerySchema.parse(req.query);
    res.json(service.list(query));
  });

  router.get('/incidents/:incidentId', (req, res) => {
    res.json(service.getById(req.params.incidentId));
  });

  router.post('/incidents/:incidentId/assign', (req, res) => {
    const { assignee } = assignIncidentSchema.parse(req.body);
    res.json(service.assign({ incidentId: req.params.incidentId, assignee }));
  });

  router.post('/incidents/:incidentId/resolve', (req, res) => {
    res.json(service.resolve({ incidentId: req.params.incidentId }));
  });

  return router;
}
