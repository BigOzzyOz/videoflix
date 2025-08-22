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
      json: () => Promise.resolve({ data: 'test' })
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
      json: () => Promise.reject(new Error('Invalid JSON'))
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(false);
    expect(apiResponse.status).toBe(500);
    expect(apiResponse.data).toBeNull();
  });

  it('should handle empty response body', async () => {
    const mockResponse = {
      ok: true,
      status: 204,
      json: () => Promise.resolve(null)
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
      json: () => Promise.reject(new SyntaxError('Unexpected token'))
    } as Response;

    const apiResponse = await ApiResponse.create(mockResponse);

    expect(apiResponse.ok).toBe(true);
    expect(apiResponse.status).toBe(200);
    expect(apiResponse.data).toBeNull();
  });
});
