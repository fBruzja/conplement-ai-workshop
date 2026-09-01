import type { Incident, IncidentStatus } from '../domain/incident.ts';

export interface IncidentFilter {
  readonly status?: IncidentStatus;
  readonly assignee?: string;
}

export class IncidentRepository {
  readonly #incidents = new Map<string, Incident>();

  save(incident: Incident): Incident {
    this.#incidents.set(incident.id, incident);
    return incident;
  }

  findById(id: string): Incident | null {
    return this.#incidents.get(id) ?? null;
  }

  findAll(filter: IncidentFilter = {}): Incident[] {
    return [...this.#incidents.values()]
      .filter((incident) => (filter.status ? incident.status === filter.status : true))
      .filter((incident) => (filter.assignee ? incident.assignee === filter.assignee : true))
      .toSorted((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  clear(): void {
    this.#incidents.clear();
  }
}
