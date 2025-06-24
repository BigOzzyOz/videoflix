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
});
