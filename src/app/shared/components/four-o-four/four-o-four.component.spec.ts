import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { FourOFourComponent } from './four-o-four.component';

describe('FourOFourComponent', () => {
  let component: FourOFourComponent;
  let fixture: ComponentFixture<FourOFourComponent>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FourOFourComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
      .compileComponents();

    fixture = TestBed.createComponent(FourOFourComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render 404 error message and elements', () => {
    const heading = fixture.nativeElement.querySelector('h1');
    const message = fixture.nativeElement.querySelector('p');
    const button = fixture.nativeElement.querySelector('button');
    const image = fixture.nativeElement.querySelector('img');

    expect(heading?.textContent).toBe('404');
    expect(message?.textContent).toBe('Page not found');
    expect(button?.textContent).toBe('Go to Home');
    expect(image?.src).toContain('404.svg');
    expect(image?.alt).toBe('404 Not Found');
  });

  it('should navigate to landing page when toLanding is called', () => {
    component.toLanding();

    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should navigate to landing when button is clicked', () => {
    const button = fixture.nativeElement.querySelector('button');

    button.click();

    expect(router.navigate).toHaveBeenCalledWith(['/landing']);
  });

  it('should have correct CSS classes', () => {
    const section = fixture.nativeElement.querySelector('section');
    const container = fixture.nativeElement.querySelector('.four-o-four__container');
    const imageDiv = fixture.nativeElement.querySelector('.four-o-four__image');

    expect(section?.className).toContain('four-o-four');
    expect(container).toBeTruthy();
    expect(imageDiv).toBeTruthy();
  });

  it('should have correct button type and click handler', () => {
    spyOn(component, 'toLanding');
    const button = fixture.nativeElement.querySelector('button');

    expect(button?.type).toBe('button');

    button.click();

    expect(component.toLanding).toHaveBeenCalled();
  });
});
