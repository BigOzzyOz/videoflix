import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  BASE_URL: string = 'http://localhost:8000/api';
  LOGIN_URL: string = `${this.BASE_URL}/users/login/`;
  LOGOUT_URL: string = `${this.BASE_URL}/users/logout/`;
  REGISTER_URL: string = `${this.BASE_URL}/users/register/`;
  VERIFY_URL: string = `${this.BASE_URL}/users/verify-email/`;
  RESET_URL: string = `${this.BASE_URL}/users/password-reset/`;
  RESET_CONFIRM_URL: string = `${this.BASE_URL}/users/password-reset/confirm/`;

  access_token: string | null = null;
  refresh_token: string | null = null;
  currentUser: any = null;

  constructor() { }

  createHeaders(method: string): RequestInit {
    const headers = new Headers();
    const apiMethod = method.toUpperCase();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this.AccessToken) {
      headers.append('Authorization', `Bearer ${this.AccessToken}`);
    }
    return {
      method: apiMethod,
      headers: headers,
      credentials: 'include' as RequestCredentials,
    };
  }

  async fetchData(url: string, method: string, body?: any) {
    const options = this.createHeaders(method);
    if (body) {
      options.body = JSON.stringify(body);
    }
    try {
      const response = await fetch(url, options);
      const responseData = await response.json();
      return {
        ok: response.ok,
        status: response.status,
        data: responseData
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  get CurrentUser(): any {
    return this.currentUser || JSON.parse(sessionStorage.getItem('currentUser') || 'null');
  }

  set CurrentUser(user: any) {
    this.currentUser = user;
    sessionStorage.setItem('currentUser', JSON.stringify(user));
  }

  set AccessToken(token: string) {
    this.access_token = token;
    sessionStorage.setItem('token', token);
  }

  get AccessToken(): string | null {
    return this.access_token || sessionStorage.getItem('token');

  }
  set RefreshToken(token: string) {
    this.refresh_token = token;
    sessionStorage.setItem('refresh_token', token);
  }

  get RefreshToken(): string | null {
    return this.refresh_token || sessionStorage.getItem('refresh_token');
  }

  async login(email: string, password: string) {
    const body = { username: email, password: password };
    return await this.fetchData(this.LOGIN_URL, 'POST', body);
  }

  async register(email: string, password: string) {
    const body = { email, password };
    return await this.fetchData(this.REGISTER_URL, 'POST', body);
  }

  async verifyEmail(token: string) {
    const body = { token };
    return await this.fetchData(this.VERIFY_URL, 'POST', body);
  }

  async resetPassword(email: string) {
    const body = { email };
    return await this.fetchData(this.RESET_URL, 'POST', body);
  }

  async resetPasswordConfirm(token: string, password: string) {
    const body = { token, password };
    return await this.fetchData(this.RESET_CONFIRM_URL, 'POST', body);
  }

  async logout() {
    return await this.fetchData(this.LOGOUT_URL, 'POST');
  }

  async refreshToken() {
    const body = { refresh_token: this.refreshToken };
    return await this.fetchData(this.LOGIN_URL, 'POST', body);
  }

}
