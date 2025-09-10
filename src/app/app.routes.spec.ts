import { routes } from './app.routes';

describe('App Routes', () => {
    it('should have a redirect from empty path to landing', () => {
        const redirect = routes.find(r => r.path === '');
        expect(redirect).toBeTruthy();
        expect(redirect?.redirectTo).toBe('landing');
        expect(redirect?.pathMatch).toBe('full');
    });

    it('should have a 404 route', () => {
        const notFound = routes.find(r => r.path === '**');
        expect(notFound).toBeTruthy();
        expect(notFound?.component?.name).toBe('FourOFourComponent');
        expect(notFound?.title).toBe('404 Not Found');
    });

    it('should have all main routes', () => {
        const expectedRoutes = [
            'landing', 'login', 'register', 'password/forgot', 'password/reset', 'verify',
            'imprint', 'privacy', 'main', 'video'
        ];
        expectedRoutes.forEach(path => {
            expect(routes.some(r => r.path === path)).toBeTrue();
        });
    });
});
