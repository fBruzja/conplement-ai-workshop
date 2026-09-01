import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { DomainError, IllegalStatusTransitionError, IncidentNotFoundError } from '../service/errors.ts';

const STATUS_BY_ERROR = new Map<string, number>([
  [IncidentNotFoundError.name, 404],
  [IllegalStatusTransitionError.name, 409],
]);

export function errorHandler(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (error instanceof ZodError) {
    res.status(400).json({
      code: 'VALIDATION_FAILED',
      message: 'Request payload is invalid',
      details: error.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
    return;
  }

  if (error instanceof DomainError) {
    res.status(STATUS_BY_ERROR.get(error.name) ?? 400).json({
      code: error.code,
      message: error.message,
    });
    return;
  }

  res.status(500).json({ code: 'INTERNAL_ERROR', message: 'Unexpected error' });
}
