import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { Router } from '@angular/router';
import { AppComponent } from './app.component';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter(routes)],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should have correct title property', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('Videoflix');
  });

  it('should render router-outlet and error-dialog', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
    expect(compiled.querySelector('app-error-dialog')).toBeTruthy();
    expect(compiled.querySelector('app-profile-selection')).toBeTruthy();
    expect(compiled.querySelector('app-loading')).toBeTruthy();
  });

  it('should redirect empty path to landing', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['']);
    expect(router.url).toBe('/landing');
  });

  it('should navigate to 404 for unknown route', async () => {
    const router = TestBed.inject(Router);
    await router.navigate(['/unknown']);
    expect(router.url).toBe('/unknown');
  });
});
