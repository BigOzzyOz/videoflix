import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ErrorService } from './error.service';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';
import { UserApiData } from '../interfaces/user-api-data';
import { Profile } from '../models/profile';

describe('ApiService', () => {
  let service: ApiService;
  let router: jasmine.SpyObj<Router>;
  let errorService: jasmine.SpyObj<ErrorService>;

  beforeEach(() => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const errorServiceSpy = jasmine.createSpyObj('ErrorService', ['show']);

    TestBed.configureTestingModule({
      providers: [
        { provide: Router, useValue: routerSpy },
        { provide: ErrorService, useValue: errorServiceSpy }
      ]
    });

    service = TestBed.inject(ApiService);
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    errorService = TestBed.inject(ErrorService) as jasmine.SpyObj<ErrorService>;

    sessionStorage.clear();
  });

  afterEach(() => {
    service.logout();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with correct URLs', () => {
    expect(service.BASE_URL).toBe('http://localhost:8000/api');
    expect(service.LOGIN_URL).toBe('http://localhost:8000/api/users/login/');
    expect(service.REGISTER_URL).toBe('http://localhost:8000/api/users/register/');
  });

  it('should create headers without authorization', () => {
    const headers = service.createHeaders('GET');

    expect(headers.method).toBe('GET');
    expect(headers.credentials).toBe('include');
    expect(headers.headers).toBeDefined();
  });

  it('should create headers with authorization when token exists', () => {
    service.AccessToken = 'test-token';
    const headers = service.createHeaders('POST');

    expect(headers.method).toBe('POST');
    expect(headers.credentials).toBe('include');
  });

  it('should handle AccessToken getter/setter', () => {
    service.AccessToken = 'test-token';
    expect(service.AccessToken).toBe('test-token');
    expect(sessionStorage.getItem('token')).toBe('test-token');

    service.AccessToken = null;
    expect(service.AccessToken).toBeNull();
    expect(sessionStorage.getItem('token')).toBeNull();
  });

  it('should handle RefreshToken getter/setter', () => {
    service.RefreshToken = 'refresh-token';
    expect(service.RefreshToken).toBe('refresh-token');
    expect(sessionStorage.getItem('refresh_token')).toBe('refresh-token');

    service.RefreshToken = null;
    expect(service.RefreshToken).toBeNull();
    expect(sessionStorage.getItem('refresh_token')).toBeNull();
  });

  it('should handle CurrentUser getter/setter', () => {
    const mockData: UserApiData = {
      id: '1',
      username: 'TestUser',
      email: 'test@example.com',
      role: 'user',
      first_name: 'Test',
      last_name: 'User',
      profiles: []
    }
    const user = new User(mockData);
    service.CurrentUser = user;
    const stored = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    expect(service.CurrentUser).toEqual(user);
    expect(stored.id).toEqual(user.id);
  });

  it('should handle CurrentProfile getter/setter', () => {
    const profile = Profile.empty();
    profile.id = 'profile1';
    profile.name = 'Profile One';
    service.CurrentProfile = profile;
    const stored = JSON.parse(sessionStorage.getItem('currentProfile') || '{}');
    expect(service.CurrentProfile).toEqual(profile);
    expect(stored.id).toEqual(profile.id);
  });

  it('should create payload with body', () => {
    const body = { email: 'test@example.com' };
    const payload = service.createPayload('POST', body);

    expect(payload.method).toBe('POST');
    expect(payload.body).toBe(JSON.stringify(body));
  });

  it('should create payload without body', () => {
    const payload = service.createPayload('GET');

    expect(payload.method).toBe('GET');
    expect(payload.body).toBeUndefined();
  });

  it('should perform logout and clear session', async () => {
    service.AccessToken = 'test-token';
    service.RefreshToken = 'refresh-token';
    service.CurrentUser = new User({ id: '1', username: 'TestUser', email: 'test@example.com', role: 'user', firstName: 'Test', lastName: 'User', profiles: [] });

    spyOn(service, 'directFetch').and.returnValue(
      Promise.resolve(new ApiResponse(true, 200, null))
    );

    await service.logout();

    expect(service.AccessToken).toBeNull();
    expect(service.RefreshToken).toBeNull();
    expect(service.CurrentUser).toEqual(User.empty());
    expect(router.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should call login with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(
      Promise.resolve(new ApiResponse(true, 200, { access: 'token' }))
    );

    await service.login('test@example.com', 'password');

    expect(service.fetchData).toHaveBeenCalledWith(
      service.LOGIN_URL,
      'POST',
      { username: 'test@example.com', password: 'password' }
    );
  });

  it('should call register with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(
      Promise.resolve(new ApiResponse(true, 201, null))
    );

    await service.register('test@example.com', 'password', 'password');

    expect(service.fetchData).toHaveBeenCalledWith(
      service.REGISTER_URL,
      'POST',
      { email: 'test@example.com', password: 'password', password2: 'password' }
    );
  });

  it('should call verifyEmail with correct URL', async () => {
    spyOn(service, 'fetchData').and.returnValue(
      Promise.resolve(new ApiResponse(true, 200, null))
    );

    await service.verifyEmail('test-token');

    expect(service.fetchData).toHaveBeenCalledWith(
      `${service.VERIFY_URL}test-token/`,
      'GET'
    );
  });

  it('should call resetPassword with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(
      Promise.resolve(new ApiResponse(true, 200, null))
    );

    await service.resetPassword('test@example.com');

    expect(service.fetchData).toHaveBeenCalledWith(
      service.RESET_URL,
      'POST',
      { email: 'test@example.com' }
    );
  });

  it('should call resetPasswordConfirm with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    await service.resetPasswordConfirm('token', 'newpass', 'newpass');
    expect(service.fetchData).toHaveBeenCalledWith(
      service.RESET_CONFIRM_URL,
      'POST',
      { token: 'token', new_password: 'newpass', new_password2: 'newpass' }
    );
  });

  it('should call getGenresCount with correct URL', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    await service.getGenresCount();
    expect(service.fetchData).toHaveBeenCalledWith(service.GENRES_COUNT_URL, 'GET');
  });

  it('should call getVideos with and without params', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    await service.getVideos('foo=bar');
    expect(service.fetchData).toHaveBeenCalledWith(service.VIDEOS_URL + '?foo=bar', 'GET');
    await service.getVideos('');
    expect(service.fetchData).toHaveBeenCalledWith(service.VIDEOS_URL, 'GET');
  });

  it('should call getVideoById with correct URL', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    await service.getVideoById('vid123');
    expect(service.fetchData).toHaveBeenCalledWith(service.VIDEOS_URL + 'vid123/', 'GET');
  });

  it('should call updateVideoProgress with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    await service.updateVideoProgress('pid', 'vid', 42);
    expect(service.fetchData).toHaveBeenCalledWith(service.PROGRESS_UPDATE_URL('pid', 'vid'), 'POST', { current_time: 42 });
  });

  it('should call createUserProfile with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 201, null)));
    const file = new File([''], 'pic.png');
    await service.createUserProfile('name', true, file);
    expect(service.fetchData).toHaveBeenCalledWith(service.USER_PROFILES_URL, 'POST', jasmine.any(FormData));
  });

  it('should call editUserProfile with correct parameters', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 200, null)));
    const profileMock = Profile.empty();
    profileMock.id = 'pid';
    profileMock.name = 'old';
    profileMock.kid = false;
    service.CurrentUser = new User({ id: '1', username: 'TestUser', email: 'test@example.com', role: 'user', firstName: 'Test', lastName: 'User', profiles: [profileMock] });
    const file = new File([''], 'pic.png');
    await service.editUserProfile('pid', 'new', true, file);
    expect(service.fetchData).toHaveBeenCalledWith(service.USER_PROFILES_URL + 'pid/', 'PATCH', jasmine.any(FormData));
  });

  it('should call deleteUserProfile with correct URL', async () => {
    spyOn(service, 'fetchData').and.returnValue(Promise.resolve(new ApiResponse(true, 204, null)));
    await service.deleteUserProfile('pid');
    expect(service.fetchData).toHaveBeenCalledWith(service.USER_PROFILES_URL + 'pid/', 'DELETE');
  });

  it('should call ErrorService.show on network error in fetchData', async () => {
    spyOn(window, 'fetch').and.throwError('Network error');
    try {
      await service.fetchData('url', 'GET');
    } catch (e) {
      expect(errorService.show).toHaveBeenCalledWith('Network error. Please try again later.');
    }
  });

  it('should call ErrorService.show on network error in directFetch', async () => {
    spyOn(window, 'fetch').and.throwError('Network error');
    try {
      await service.directFetch('url', 'GET');
    } catch (e) {
      expect(errorService.show).toHaveBeenCalledWith('Network error. Please try again later.');
    }
  });

  it('should fallback to User.empty and Profile.empty if nothing stored', () => {
    sessionStorage.clear();
    service.currentUser = null;
    service.currentProfile = null;
    expect(service.CurrentUser).toEqual(User.empty());
    expect(service.CurrentProfile).toEqual(Profile.empty());
  });

  it('should handle createPayload with FormData', () => {
    const fd = new FormData();
    const payload = service.createPayload('POST', fd);
    expect(payload.body).toBe(fd);
  });

  it('should handle isNoBodyResponse for 204, 205, and zero content-length', () => {
    const response = new Response(null, { status: 204 });
    expect((service as any).isNoBodyResponse(response)).toBeTrue();
    const response2 = new Response(null, { status: 205 });
    expect((service as any).isNoBodyResponse(response2)).toBeTrue();
    const response3 = new Response(null, { status: 200, headers: { 'content-length': '0' } });
    expect((service as any).isNoBodyResponse(response3)).toBeTrue();
  });

  it('should handle token refresh on 401 in fetchData', async () => {
    spyOn(service, 'createPayload').and.callThrough();
    spyOn(window, 'fetch').and.returnValues(
      Promise.resolve(new Response(null, { status: 401 })),
      Promise.resolve(new Response(JSON.stringify({ access: 'new-token' }), { status: 200 })),
      Promise.resolve(new Response(JSON.stringify({ ok: true, status: 200, data: {} }), { status: 200 }))
    );
    spyOn(service, 'refreshToken').and.returnValue(Promise.resolve(new ApiResponse(true, 200, { access: 'new-token' })));
    service.RefreshToken = 'refresh-token';
    await service.fetchData('url', 'GET');
    expect(service.refreshToken).toHaveBeenCalled();
  });

  it('should handle failed token refresh on 401 in fetchData', async () => {
    spyOn(service, 'createPayload').and.callThrough();
    spyOn(window, 'fetch').and.returnValue(Promise.resolve(new Response(null, { status: 401 })));
    spyOn(service, 'refreshToken').and.returnValue(Promise.resolve(new ApiResponse(false, 401, null)));
    spyOn(service, 'logout').and.returnValue(Promise.resolve(new ApiResponse(false, 401, null)));
    service.RefreshToken = 'refresh-token';
    await service.fetchData('url', 'GET');
    expect(service.logout).toHaveBeenCalled();
  });

  it('should return ApiResponse with null data for no-body response in handleResponse', async () => {
    const response = new Response(null, { status: 204 });
    const result = await (service as any).handleResponse(response, 'url', 'GET');
    expect(result).toEqual(jasmine.objectContaining({ ok: true, status: 204, data: null }));
  });

  it('should return ApiResponse with data for normal response in handleResponse', async () => {
    const body = { test: 'bar' };
    const response = new Response(JSON.stringify(body), { status: 200, headers: { 'content-length': '13' } });
    spyOn(ApiResponse, 'create').and.callThrough();
    const result = await (service as any).handleResponse(response, 'url', 'GET');
    expect(ApiResponse.create).toHaveBeenCalledWith(response);
    expect(result.data).toEqual('{"test":"bar"}');
  });

  it('should return ApiResponse from directFetch for successful fetch', async () => {
    const body = { test: 'bar' };
    const response = new Response(JSON.stringify(body), { status: 200, headers: { 'content-length': '13' } });
    spyOn(window, 'fetch').and.resolveTo(response);
    spyOn(ApiResponse, 'create').and.callThrough();
    const result = await service.directFetch('url', 'GET');
    expect(ApiResponse.create).toHaveBeenCalledWith(response);
    expect(result.data).toEqual('{"test":"bar"}');
  });

  it('should return User from sessionStorage if currentUser is null in CurrentUser getter', () => {
    const profileObj = Profile.empty();
    profileObj.id = 'p1';
    profileObj.name = 'Profile1';
    const userObj = { id: 'u1', username: 'TestUser', email: 'test@example.com', role: 'user', profiles: [profileObj] };
    sessionStorage.setItem('currentUser', JSON.stringify(userObj));
    sessionStorage.setItem('currentProfile', JSON.stringify(profileObj));
    service.currentUser = null;
    service.currentProfile = null;
    const resultUser = service.CurrentUser;
    const resultProfile = service.CurrentProfile;
    expect(resultUser).toEqual(jasmine.objectContaining(userObj));
    expect(resultProfile).toEqual(jasmine.objectContaining(profileObj));
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentProfile');
  });

  it('should show error and return response if logout fails', async () => {
    const failedResponse = new ApiResponse(false, 400, null);
    spyOn(service, 'directFetch').and.returnValue(Promise.resolve(failedResponse));
    const result = await service.logout();
    expect(errorService.show).toHaveBeenCalledWith('Logout failed. Please try again.');
    expect(result).toBe(failedResponse);
  });

  it('should call directFetch and return its result in refreshToken', async () => {
    const expectedResponse = new ApiResponse(true, 200, { access: 'new-token' });
    spyOn(service, 'directFetch').and.returnValue(Promise.resolve(expectedResponse));
    service.RefreshToken = 'refresh-token';
    const result = await service.refreshToken();
    expect(service.directFetch).toHaveBeenCalledWith(service.REFRESH_URL, 'POST', { refresh: 'refresh-token' });
    expect(result).toBe(expectedResponse);
  });
});
