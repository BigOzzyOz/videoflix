import { TestBed } from '@angular/core/testing';
import { ErrorService } from './error.service';

describe('ErrorService', () => {
  let service: ErrorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ErrorService);
    jasmine.clock().install();
  });

  afterEach(() => {
    jasmine.clock().uninstall();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize with null error message', () => {
    service.errorMessage$.subscribe(message => {
      expect(message).toBeNull();
    });
  });

  it('should show string error message', () => {
    service.show('Test error message');

    service.errorMessage$.subscribe(message => {
      expect(message).toBe('Test error message');
    });
  });

  it('should show error from response object with detail', () => {
    const response = { data: { detail: 'Detailed error message' } };
    service.show(response);

    service.errorMessage$.subscribe(message => {
      expect(message).toBe('Detailed error message');
    });
  });

  it('should show error from array data', () => {
    const response = { data: ['First error', 'Second error'] };
    service.show(response);

    service.errorMessage$.subscribe(message => {
      expect(message).toBe('First error');
    });
  });

  it('should show error from object with first key', () => {
    const response = { data: { email: ['Invalid email format'] } };
    service.show(response);

    service.errorMessage$.subscribe(message => {
      expect(message).toBe('Invalid email format');
    });
  });

  it('should show default error for unknown format', () => {
    const response = {};
    service.show(response);

    service.errorMessage$.subscribe(message => {
      expect(message).toBe('An unexpected error occurred. Please try again later.');
    });
  });

  it('should auto-clear error after 5 seconds', () => {
    service.show('Test error');

    expect(service.errorMessage$.value).toBe('Test error');

    jasmine.clock().tick(5001);

    expect(service.errorMessage$.value).toBeNull();
  });

  it('should clear error manually', () => {
    service.show('Test error');
    service.clear();

    service.errorMessage$.subscribe(message => {
      expect(message).toBeNull();
    });
  });

  it('should clear timeout when manually clearing', () => {
    service.show('Test error');
    expect(service.errorTimer).not.toBeNull();

    service.clear();
    expect(service.errorTimer).toBeNull();
  });

  it('should show string error', () => {
    service.show('Test error');
    expect(service.errorMessage$.getValue()).toBe('Test error');
  });

  it('should show error from array', () => {
    service.show(['Array error', 'Other']);
    expect(service.errorMessage$.getValue()).toBe('Array error');
  });

  it('should show error from object.detail', () => {
    service.show({ detail: 'Detail error' });
    expect(service.errorMessage$.getValue()).toBe('Detail error');
  });

  it('should show error from object with array property', () => {
    service.show({ field: ['Field error'] });
    expect(service.errorMessage$.getValue()).toBe('Field error');
  });

  it('should show error from object with string property', () => {
    service.show({ field: 'Field string error' });
    expect(service.errorMessage$.getValue()).toBe('Field string error');
  });

  it('should fallback to default message for unknown format', () => {
    service.show({});
    expect(service.errorMessage$.getValue()).toBe('An unexpected error occurred. Please try again later.');
  });

  it('should clear error after timeout', () => {
    service.show('Timeout error');
    expect(service.errorMessage$.getValue()).toBe('Timeout error');
    jasmine.clock().tick(5000);
    expect(service.errorMessage$.getValue()).toBeNull();
  });

  it('should clear error manually', () => {
    service.show('Manual clear error');
    expect(service.errorMessage$.getValue()).toBe('Manual clear error');
    service.clear();
    expect(service.errorMessage$.getValue()).toBeNull();
  });

  it('should clear previous error timer before showing new error', () => {
    service.show('First error');
    const firstTimer = service.errorTimer;
    service.show('Second error');
    expect(firstTimer).not.toBeNull();
    expect(service.errorTimer).not.toBe(firstTimer);
    expect(service.errorMessage$.getValue()).toBe('Second error');
  });

  it('should extract error message from string data property', () => {
    const response = { data: 'String error message' };
    const result = (service as any).extractErrorMessage(response);
    expect(result).toBe('String error message');
  });

});
