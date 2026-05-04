# observability

This library was generated with [Nx](https://nx.dev).

Provides:

- Global HTTP interceptors for request logging and error logging.
- `UserAccessLogEventPort` to publish user-access-log events to RabbitMQ.
- A consumer that persists user-access-log events into the `UserAccessLog` table.
- DLQ handling for user-access-log: retry queue with exponential backoff (5s, 10, 15), then persistence of failed messages in `FailedMessage`.
- `FailedMessageRepository` (exported) for persisting messages that exceeded max retries (shared with the medical module for exam processing DLQ).

## Running unit tests

Run `nx test observability` to execute the unit tests via [Jest](https://jestjs.io).
