import { z } from 'zod';
import { INCIDENT_SEVERITIES, INCIDENT_STATUSES } from '../domain/incident.ts';

export const createIncidentSchema = z.object({
  title: z.string().min(3).max(200),
  severity: z.enum(INCIDENT_SEVERITIES),
});

export const assignIncidentSchema = z.object({
  assignee: z.string().min(1).max(100),
});

export const listIncidentsQuerySchema = z.object({
  status: z.enum(INCIDENT_STATUSES).optional(),
  assignee: z.string().min(1).optional(),
});
