export interface ApiErrorBody { code?: string; message?: string; }

export class ApiError extends Error {
  constructor(public readonly status: number, public readonly code: string, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export function responseApiError(status: number, value: unknown): ApiError {
  const body = value && typeof value === 'object' ? value as ApiErrorBody : {};
  const fallback = status === 401 ? 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.'
    : status === 403 ? 'Diese Anfrage wurde abgelehnt. Bitte lade die Ansicht neu.'
      : status === 429 ? 'Zu viele Anfragen. Bitte warte einen Moment.'
        : 'Der Server ist gerade nicht erreichbar.';
  return new ApiError(status,
    typeof body.code === 'string' ? body.code : status === 401 ? 'UNAUTHENTICATED' : status ? 'HTTP_ERROR' : 'NETWORK_ERROR',
    typeof body.message === 'string' ? body.message : fallback);
}

export function requestTimeoutError(): ApiError {
  return new ApiError(0, 'REQUEST_TIMEOUT', 'Die Antwort dauert zu lange. Eine Änderung könnte trotzdem angekommen sein. Bitte prüfe den aktuellen Stand, bevor du sie erneut sendest.');
}
