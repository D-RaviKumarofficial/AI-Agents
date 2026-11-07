export const ServiceResultStatusENUM = {
  OK: 'OK',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  SERVICE_EXCEPTION: 'SERVICE_EXCEPTION',
  UNAUTHORIZED: 'UNAUTHORIZED',
} as const;

export interface ServiceResult<T> {
  statusCode: (typeof ServiceResultStatusENUM)[keyof typeof ServiceResultStatusENUM];
  data: T | null;
  message: string;
}

export function adaptApiResponse<T>(response: { data: T }): ServiceResult<T> {
  return { statusCode: ServiceResultStatusENUM.OK, data: response.data, message: 'Success' };
}

export function serviceFailureResponse<T>(error: unknown): ServiceResult<T> {
  void error;
  return {
    statusCode: ServiceResultStatusENUM.SERVICE_EXCEPTION,
    data: null,
    message: 'The service is unavailable. Please try again.',
  };
}
