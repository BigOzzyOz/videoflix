import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { ApiService } from './api.service';
import { ErrorService } from './error.service';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';
import { UserApiData } from '../interfaces/user-api-data';

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
    spyOn(service, 'fetchData').and.returnValue(
      Promise.resolve(new ApiResponse(true, 200, null))
    );

    await service.resetPasswordConfirm('token', 'newpass', 'newpass');

    expect(service.fetchData).toHaveBeenCalledWith(
      service.RESET_CONFIRM_URL,
      'POST',
      { token: 'token', new_password: 'newpass', new_password2: 'newpass' }
    );
  });
});
