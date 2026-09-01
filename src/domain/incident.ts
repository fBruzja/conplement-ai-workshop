export const INCIDENT_STATUSES = ['OPEN', 'ASSIGNED', 'RESOLVED'] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly assignee: string | null;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
}

const ALLOWED_TRANSITIONS: Record<IncidentStatus, readonly IncidentStatus[]> = {
  OPEN: ['ASSIGNED'],
  ASSIGNED: ['RESOLVED'],
  RESOLVED: [],
};

export function canTransition(from: IncidentStatus, to: IncidentStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}
