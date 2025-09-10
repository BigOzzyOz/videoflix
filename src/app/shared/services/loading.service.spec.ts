import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';


describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoadingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have initial loading state as false', () => {
    expect(service.loading()).toBe(false);
  });

  it('should set loading state to true', () => {
    service.setLoading(true);
    expect(service.loading()).toBe(true);
  });

  it('should set loading state to false', () => {
    service.setLoading(true);
    service.setLoading(false);
    expect(service.loading()).toBe(false);
  });
});
