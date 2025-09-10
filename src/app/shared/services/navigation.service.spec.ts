import { TestBed } from '@angular/core/testing';
import { NavigationService } from './navigation.service';


describe('NavigationService', () => {
  let service: NavigationService;
  let routerSpy: jasmine.SpyObj<any>;

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      providers: [
        NavigationService,
        { provide: 'Router', useValue: routerSpy }
      ]
    });
    service = TestBed.inject(NavigationService);
    (service as any).router = routerSpy;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should navigate to /main on goBack', () => {
    service.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/main']);
  });
});
