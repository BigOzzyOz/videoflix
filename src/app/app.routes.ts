import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LegalNoticeComponent } from './components/legal-notice/legal-notice.component';
import { LoginComponent } from './components/login/login.component';
import { LandingComponent } from './components/landing/landing.component';
import { PasswordResetComponent } from './components/password-reset/password-reset.component';
import { FourOFourComponent } from './shared/components/four-o-four/four-o-four.component';

export const routes: Routes = [
    {
        path: 'landing',
        component: LandingComponent,
    },
    {
        path: 'login',
        component: LoginComponent,
        title: 'Login',
    },
    {
        path: 'register',
        component: RegisterComponent,
        title: 'Register',
    },
    {
        path: 'password/forgot',
        component: PasswordResetComponent,
        title: 'Forget Password',
    },
    {
        path: 'password/reset',
        component: PasswordResetComponent,
        title: 'Reset Password',
    },
    {
        path: 'verify',
        component: PasswordResetComponent,
        title: 'Verify Account',
    },
    {
        path: 'verify',
        component: PasswordResetComponent,
        title: 'Verify Account',
    },
    {
        path: 'imprint',
        component: LegalNoticeComponent,
        title: 'Imprint',
    },
    {
        path: 'privacy',
        component: LegalNoticeComponent,
        title: 'Privacy Policy',
    },
    {
        path: '',
        redirectTo: 'landing',
        pathMatch: 'full'
    },
    {
        path: '**',
        component: FourOFourComponent,
        title: '404 Not Found',
        data: {
            message: 'The page you are looking for does not exist.'
        }
    }
];
