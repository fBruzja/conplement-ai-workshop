# Incident Comments

**Ticket:** #1042
**Depends on:** none
**Touches:** `src/domain/`, `src/repository/`, `src/service/`, `src/api/`, `tests/`

> **Workshop note:** this spec is intentionally **not implemented**. It is the live-demo target.

---

## 1. Goal

Responders need to record what they observed and what they tried while working an incident. Add the
ability to append timestamped comments to an incident and to read them back in chronological order.

---

## 2. Scope

In scope:

- Appending a comment to an existing incident
- Listing the comments of an incident, oldest first
- Blocking comments on incidents that are already `RESOLVED`

**Out of scope** — do not implement these, even though they are adjacent and tempting:

- Editing or deleting a comment — comments are append-only; a later ticket adds redaction
- Comment authors as first-class users — `author` is a free-text string for now
- Notifications, mentions or `@`-parsing — handled by the notification service, not here
- Pagination of the comment list — deferred until an incident is observed with >50 comments
- Returning comments inside the incident payload — comments have their own endpoint only

---

## 3. Architecture rules

Layering and coding conventions follow `AGENTS.md` and the `typescript-api-conventions` skill.
Additional rules specific to this change:

- A comment is part of the incident aggregate. It has no repository of its own — `IncidentRepository`
  owns comment storage
- Comment text is immutable once written
- `createdAt` is set by the service, never accepted from the client
- Comment ordering is a domain guarantee (oldest first), not a client-side concern

---

## 4. Contracts

### Endpoints

| Method & path                     | Body                     | Success | Errors                                             |
| --------------------------------- | ------------------------ | ------- | -------------------------------------------------- |
| `POST /incidents/:id/comments`    | `{ author, message }`    | `201`   | `404` unknown incident, `400` invalid, `409` resolved |
| `GET /incidents/:id/comments`     | —                        | `200`   | `404` unknown incident                              |

### Validation

| Field     | Rule                        |
| --------- | --------------------------- |
| `author`  | string, 1–100 characters    |
| `message` | string, 1–2000 characters   |

### Types

| Name                  | Layer   | Shape                                                  |
| --------------------- | ------- | ------------------------------------------------------ |
| `IncidentComment`     | domain  | `{ id, incidentId, author, message, createdAt }`       |
| `AddCommentCommand`   | service | `{ incidentId, author, message }`                      |
| `IncidentCommentDto`  | service | `{ id, author, message, createdAt }`                   |

### Error codes

| Code                 | Status | Raised when                                    |
| -------------------- | ------ | ---------------------------------------------- |
| `INCIDENT_NOT_FOUND` | `404`  | the incident id does not exist (reuse existing) |
| `INCIDENT_CLOSED`    | `409`  | the incident status is `RESOLVED`               |
| `VALIDATION_FAILED`  | `400`  | body fails schema validation (reuse existing)   |

---

## 5. Acceptance criteria

1. Adding a comment to an `OPEN` incident returns `201` and the created comment with a server-set
   `createdAt`
2. Adding a comment to an `ASSIGNED` incident succeeds
3. Adding a comment to a `RESOLVED` incident returns `409` with code `INCIDENT_CLOSED`
4. Adding a comment to an unknown incident id returns `404` with code `INCIDENT_NOT_FOUND`
5. An empty `message` returns `400` with code `VALIDATION_FAILED`
6. Listing comments returns them oldest first
7. Listing comments of an incident with no comments returns an empty array, not `404`
8. Listing comments of an unknown incident returns `404`

---

## 6. Testing requirements

- Layer under test: `service` — business rules are not tested through HTTP
- Mandatory cases: every acceptance criterion above, including all three error paths
- Error assertions check the thrown class, not the message text
- Definition of done: `npm test` and `npm run typecheck` both pass
