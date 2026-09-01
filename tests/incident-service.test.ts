import assert from 'node:assert/strict';
import { beforeEach, describe, it } from 'node:test';
import { IncidentRepository } from '../src/repository/incident-repository.ts';
import { IllegalStatusTransitionError, IncidentNotFoundError } from '../src/service/errors.ts';
import { IncidentService } from '../src/service/incident-service.ts';

describe('IncidentService', () => {
  let repository: IncidentRepository;
  let service: IncidentService;

  beforeEach(() => {
    repository = new IncidentRepository();
    service = new IncidentService(repository);
  });

  describe('create', () => {
    it('creates an incident in OPEN status with no assignee', () => {
      const incident = service.create({ title: 'Pump offline', severity: 'HIGH' });

      assert.equal(incident.status, 'OPEN');
      assert.equal(incident.assignee, null);
      assert.equal(incident.resolvedAt, null);
    });
  });

  describe('assign', () => {
    it('moves an OPEN incident to ASSIGNED', () => {
      const created = service.create({ title: 'Pump offline', severity: 'HIGH' });

      const assigned = service.assign({ incidentId: created.id, assignee: 'ada' });

      assert.equal(assigned.status, 'ASSIGNED');
      assert.equal(assigned.assignee, 'ada');
    });

    it('rejects assigning an already RESOLVED incident', () => {
      const created = service.create({ title: 'Pump offline', severity: 'HIGH' });
      service.assign({ incidentId: created.id, assignee: 'ada' });
      service.resolve({ incidentId: created.id });

      assert.throws(
        () => service.assign({ incidentId: created.id, assignee: 'grace' }),
        IllegalStatusTransitionError,
      );
    });

    it('rejects an unknown incident id', () => {
      assert.throws(
        () => service.assign({ incidentId: 'does-not-exist', assignee: 'ada' }),
        IncidentNotFoundError,
      );
    });
  });

  describe('resolve', () => {
    it('rejects resolving an incident that was never assigned', () => {
      const created = service.create({ title: 'Pump offline', severity: 'HIGH' });

      assert.throws(
        () => service.resolve({ incidentId: created.id }),
        IllegalStatusTransitionError,
      );
    });

    it('stamps resolvedAt when resolving an ASSIGNED incident', () => {
      const created = service.create({ title: 'Pump offline', severity: 'HIGH' });
      service.assign({ incidentId: created.id, assignee: 'ada' });

      const resolved = service.resolve({ incidentId: created.id });

      assert.equal(resolved.status, 'RESOLVED');
      assert.notEqual(resolved.resolvedAt, null);
    });
  });

  describe('list', () => {
    it('filters by status', () => {
      const open = service.create({ title: 'Pump offline', severity: 'HIGH' });
      const other = service.create({ title: 'Sensor drift', severity: 'LOW' });
      service.assign({ incidentId: other.id, assignee: 'ada' });

      const result = service.list({ status: 'OPEN' });

      assert.deepEqual(
        result.map((incident) => incident.id),
        [open.id],
      );
    });
  });
});
