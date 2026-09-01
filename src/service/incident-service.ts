import { randomUUID } from 'node:crypto';
import { canTransition, type IncidentSeverity, type IncidentStatus } from '../domain/incident.ts';
import type { IncidentRepository } from '../repository/incident-repository.ts';
import { IllegalStatusTransitionError, IncidentNotFoundError } from './errors.ts';

export interface CreateIncidentCommand {
  readonly title: string;
  readonly severity: IncidentSeverity;
}

export interface AssignIncidentCommand {
  readonly incidentId: string;
  readonly assignee: string;
}

export interface ResolveIncidentCommand {
  readonly incidentId: string;
}

export interface ListIncidentsQuery {
  readonly status?: IncidentStatus;
  readonly assignee?: string;
}

export interface IncidentDto {
  readonly id: string;
  readonly title: string;
  readonly severity: IncidentSeverity;
  readonly status: IncidentStatus;
  readonly assignee: string | null;
  readonly createdAt: string;
  readonly resolvedAt: string | null;
}

export class IncidentService {
  readonly #repository: IncidentRepository;

  constructor(repository: IncidentRepository) {
    this.#repository = repository;
  }

  create(command: CreateIncidentCommand): IncidentDto {
    const incident = this.#repository.save({
      id: randomUUID(),
      title: command.title,
      severity: command.severity,
      status: 'OPEN',
      assignee: null,
      createdAt: new Date().toISOString(),
      resolvedAt: null,
    });
    return toDto(incident);
  }

  list(query: ListIncidentsQuery = {}): IncidentDto[] {
    return this.#repository.findAll(query).map(toDto);
  }

  getById(incidentId: string): IncidentDto {
    const incident = this.#repository.findById(incidentId);
    if (incident === null) {
      throw new IncidentNotFoundError(incidentId);
    }
    return toDto(incident);
  }

  assign(command: AssignIncidentCommand): IncidentDto {
    const incident = this.#repository.findById(command.incidentId);
    if (incident === null) {
      throw new IncidentNotFoundError(command.incidentId);
    }
    if (!canTransition(incident.status, 'ASSIGNED')) {
      throw new IllegalStatusTransitionError(incident.status, 'ASSIGNED');
    }
    return toDto(
      this.#repository.save({ ...incident, status: 'ASSIGNED', assignee: command.assignee }),
    );
  }

  resolve(command: ResolveIncidentCommand): IncidentDto {
    const incident = this.#repository.findById(command.incidentId);
    if (incident === null) {
      throw new IncidentNotFoundError(command.incidentId);
    }
    if (!canTransition(incident.status, 'RESOLVED')) {
      throw new IllegalStatusTransitionError(incident.status, 'RESOLVED');
    }
    return toDto(
      this.#repository.save({
        ...incident,
        status: 'RESOLVED',
        resolvedAt: new Date().toISOString(),
      }),
    );
  }
}

function toDto(incident: IncidentDto): IncidentDto {
  return {
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    assignee: incident.assignee,
    createdAt: incident.createdAt,
    resolvedAt: incident.resolvedAt,
  };
}
