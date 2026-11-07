import {
  ServiceResultStatusENUM,
  serviceFailureResponse,
  type ServiceResult,
} from '@/helpers/serviceResult/serviceResultHelpers.ts';

// Reserved for a future authenticated BFF. The demo uses mock services instead.
// Production should use a same-origin gateway with secure HttpOnly session cookies.
class BffAdapter {
  private async request<T>(url: string, method: string, data?: unknown): Promise<ServiceResult<T>> {
    try {
      const baseUrl: string | undefined = import.meta.env.VITE_API_BASE_URL;
      if (!baseUrl)
        return {
          statusCode: ServiceResultStatusENUM.SERVICE_EXCEPTION,
          data: null,
          message: 'BFF endpoint has not been configured.',
        };
      const target = new URL(url.replace(/^\//, ''), `${baseUrl.replace(/\/$/, '')}/`);
      if (target.protocol !== 'https:')
        return {
          statusCode: ServiceResultStatusENUM.BAD_REQUEST,
          data: null,
          message: 'The BFF endpoint must use HTTPS.',
        };
      const response = await fetch(target, {
        method,
        credentials: 'include',
        signal: AbortSignal.timeout(30000),
        headers: {
          'Content-Type': 'application/json',
          'x-client-type': 'web',
          'x-correlation-id': crypto.randomUUID(),
        },
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      if (!response.ok)
        return {
          statusCode:
            response.status === 401 || response.status === 403
              ? ServiceResultStatusENUM.UNAUTHORIZED
              : ServiceResultStatusENUM.SERVICE_EXCEPTION,
          data: null,
          message: 'The request could not be completed.',
        };
      return {
        statusCode: ServiceResultStatusENUM.OK,
        data: (await response.json()) as T,
        message: 'Success',
      };
    } catch (error) {
      return serviceFailureResponse<T>(error);
    }
  }
  get<T>(url: string): Promise<ServiceResult<T>> {
    return this.request<T>(url, 'GET');
  }
  post<T>(url: string, data?: unknown): Promise<ServiceResult<T>> {
    return this.request<T>(url, 'POST', data);
  }
}
export const bffAdapter = new BffAdapter();
