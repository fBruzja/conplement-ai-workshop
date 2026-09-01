export class DomainError extends Error {
  readonly code: string;

  constructor(message: string, code: string) {
    super(message);
    this.name = new.target.name;
    this.code = code;
  }
}

export class IncidentNotFoundError extends DomainError {
  constructor(id: string) {
    super(`Incident ${id} not found`, 'INCIDENT_NOT_FOUND');
  }
}

export class IllegalStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(`Cannot transition incident from ${from} to ${to}`, 'ILLEGAL_STATUS_TRANSITION');
  }
}
