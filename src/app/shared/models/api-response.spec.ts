import { ApiResponse } from './api-response';

describe('ApiResponse', () => {
  it('should create an instance with constructor', () => {
    const response = new ApiResponse(true, 200, { message: 'success' });

    expect(response.ok).toBe(true);
    expect(response.status).toBe(200);
    expect(response.data).toEqual({ message: 'success' });
  });

  it('should create from Response object successfully', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: (key: string) => {
          if (key === 'content-type') return 'application/json';
          if (key === 'content-length') return '123';
          return null;
        }
      },
      text: () => Promise.resolve(JSON.stringify({ data: 'test' }))
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.data).toEqual({ data: 'test' });
  });

  it('should handle JSON parsing errors', async () => {
    const mockResponse = {
      ok: false,
      status: 500,
      headers: { get: (key: string) => { /* ... */ } },
      text: () => { throw new Error('Invalid JSON'); }
    } as unknown as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(false);
    expect(apiResponse.status).toBe(500);
    expect(apiResponse.data).toBeNull();
  });

  it('should handle empty response body', async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      headers: {
        get: (key: string) => {
          if (key === 'content-type') return 'application/json';
          if (key === 'content-length') return '0';
          return null;
        }
      },
      text: () => Promise.resolve('')
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(204);
    expect(apiResponse.data).toBeNull();
  });

  it('should handle non-JSON responses', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: (key: string) => {
          if (key === 'content-type') return 'text/plain';
          if (key === 'content-length') return '123';
          return null;
        }
      },
      text: () => Promise.resolve('plain text')
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.data).toBe('plain text');
  });

  it('should identify success, client error, server error, unauthorized, forbidden, not found', () => {
    expect(new ApiResponse(true, 200, {}).isSuccess()).toBeTrue();
    expect(new ApiResponse(false, 404, {}).isClientError()).toBeTrue();
    expect(new ApiResponse(false, 500, {}).isServerError()).toBeTrue();
    expect(new ApiResponse(false, 401, {}).isUnauthorized()).toBeTrue();
    expect(new ApiResponse(false, 403, {}).isForbidden()).toBeTrue();
    expect(new ApiResponse(false, 404, {}).isNotFound()).toBeTrue();
  });

  it('should detect if data is present', () => {
    expect(new ApiResponse(true, 200, { foo: 'bar' }).hasData()).toBeTrue();
    expect(new ApiResponse(true, 200, null).hasData()).toBeFalse();
    expect(new ApiResponse(true, 200, undefined).hasData()).toBeFalse();
  });

  it('should return correct error message', () => {
    expect(new ApiResponse(false, 400, null, 'Custom error').getErrorMessage()).toBe('Custom error');
    expect(new ApiResponse(false, 400, { message: 'Backend error' }).getErrorMessage()).toBe('Backend error');
    expect(new ApiResponse(false, 400, { error: 'Error field' }).getErrorMessage()).toBe('Error field');
    expect(new ApiResponse(false, 400, null).getErrorMessage()).toBe('HTTP 400');
  });

  it('should set data to null if response body is empty JSON', async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      headers: {
        get: (key: string) => {
          if (key === 'content-type') return 'application/json';
          if (key === 'content-length') return '123';
          return null;
        }
      },
      text: () => Promise.resolve('   ')
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);
    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.data).toBeNull();
  });
});
