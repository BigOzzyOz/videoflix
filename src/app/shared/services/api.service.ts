import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ErrorService } from './error.service';
import { ApiResponse } from '../models/api-response';
import { User } from '../models/user';
import { Profile } from '../models/profile';
import { environment } from '../../../environments/environment';

/**
 * Service for handling all API requests, authentication, and user/profile state.
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private router = inject(Router);
  private errorService = inject(ErrorService);
  BASE_URL: string = environment.apiUrl;
  VERIFY_TOKEN = `${this.BASE_URL}/token/verify/`;
  LOGIN_URL: string = `${this.BASE_URL}/users/login/`;
  LOGOUT_URL: string = `${this.BASE_URL}/users/logout/`;
  REGISTER_URL: string = `${this.BASE_URL}/users/register/`;
  VERIFY_URL: string = `${this.BASE_URL}/users/verify-email/`;
  REFRESH_URL: string = `${this.BASE_URL}/token/refresh/`;
  RESET_URL: string = `${this.BASE_URL}/users/password-reset/`;
  RESET_CONFIRM_URL: string = `${this.BASE_URL}/users/password-reset/confirm/`;
  GENRES_COUNT_URL: string = `${this.BASE_URL}/videos/genre-count/`;
  VIDEOS_URL: string = `${this.BASE_URL}/videos/`;
  USER_PROFILES_URL: string = `${this.BASE_URL}/users/me/profiles/`;
  PROGRESS_UPDATE_URL(profileId: string, videoFileId: string) {
    return `${this.BASE_URL}/users/me/profiles/${profileId}/progress/${videoFileId}/update/`;
  }

  access_token: string | null = null;
  refresh_token: string | null = null;
  currentUser: User | null = null;
  currentProfile: Profile | null = null;

  /**
   * Initializes ApiService and loads session data from storage.
   */
  constructor() {
    const storedToken = sessionStorage.getItem('token');
    if (storedToken) this.access_token = storedToken;
    const storedRefreshToken = sessionStorage.getItem('refresh_token');
    if (storedRefreshToken) this.refresh_token = storedRefreshToken;
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) this.currentUser = new User(JSON.parse(storedUser));
    const storedProfile = sessionStorage.getItem('currentProfile');
    if (storedProfile) this.currentProfile = new Profile(JSON.parse(storedProfile));
  }

  /**
   * Creates request headers for API calls, including authorization if available.
   * @param method HTTP method (GET, POST, etc.)
   */
  createHeaders(method: string): RequestInit {
    const headers = new Headers();
    const apiMethod = method.toUpperCase();
    if (this.AccessToken) {
      headers.append('Authorization', `Bearer ${this.AccessToken}`);
    }
    return {
      method: apiMethod,
      headers: headers,
      credentials: 'include' as RequestCredentials,
    };
  }

  /**
   * Performs a fetch request with error and token handling.
   * @param url API endpoint
   * @param method HTTP method
   * @param body Optional request body
   */
  async fetchData(url: string, method: string, body?: Object): Promise<ApiResponse> {
    let options = this.createPayload(method, body);
    try {
      let response = await fetch(url, options);
      const responseData = await this.handleResponse(response, url, method, body);
      return responseData;
    } catch (error) {
      this.errorService.show('Network error. Please try again later.');
      throw error;
    }
  }

  /**
   * Handles the response, including token refresh if needed.
   * @param response Fetch API Response object
   * @param url API endpoint
   * @param method HTTP method
   * @param body Optional request body
   */
  private async handleResponse(response: Response, url: string, method: string, body?: Object): Promise<ApiResponse> {
    if (response.status === 401 && this.RefreshToken !== null) {
      this.AccessToken = null;
      const tokenResponse: ApiResponse = await this.refreshToken();
      if (!tokenResponse.ok || tokenResponse.data === null) {
        this.errorService.show('Session expired. Please log in again.');
        return this.logout();
      }
      this.AccessToken = tokenResponse.data['access'];
      const options = this.createPayload(method, body);
      response = await fetch(url, options);
    }
    if (this.isNoBodyResponse(response)) return new ApiResponse(response.ok, response.status, null);
    const responseData = await ApiResponse.create(response);
    return responseData;
  }

  /**
   * Determines if the response has no body (e.g., 204 No Content).
   * @param response Fetch API Response object
   */
  private isNoBodyResponse(response: Response): boolean {
    return response.status === 204 || response.status === 205 || !response.headers.get('content-length') || response.headers.get('content-length') === '0';
  }

  /**
   * Performs a direct fetch request without token refresh logic.
   * @param url API endpoint
   * @param method HTTP method
   * @param body Optional request body
   */
  async directFetch(url: string, method: string, body?: Object): Promise<ApiResponse> {
    const options = this.createPayload(method, body);
    try {
      const response = await fetch(url, options);
      return await ApiResponse.create(response);
    } catch (error) {
      this.errorService.show('Network error. Please try again later.');
      throw error;
    }
  }

  /**
   * Creates fetch payload with headers and body for API requests.
   * Adds JSON headers for non-FormData bodies.
   * @param method HTTP method
   * @param body Optional request body (object or FormData)
   * @returns RequestInit object for fetch
   */
  createPayload(method: string, body?: Object): RequestInit {
    const options = this.createHeaders(method);

    if (body && body instanceof FormData) options.body = body;
    else {
      if (options.headers instanceof Headers) {
        options.headers.append('Content-Type', 'application/json');
        options.headers.append('Accept', 'application/json');
      }
      if (body) options.body = JSON.stringify(body);
    }
    return options;
  }

  /**
   * Gets the current user from memory or session storage.
   */
  get CurrentUser(): User {
    const stored = sessionStorage.getItem('currentUser');
    if (this.currentUser) return this.currentUser;
    else if (stored) return new User(JSON.parse(stored));
    else return User.empty();
  }

  /**
   * Sets the current user and updates session storage.
   */
  set CurrentUser(user: User | null) {
    if (!user) {
      this.currentUser = User.empty();
      sessionStorage.removeItem('currentUser');
      return;
    } else {
      this.currentUser = new User(user);
      sessionStorage.setItem('currentUser', JSON.stringify(user));
    }
  }

  /**
   * Gets the current profile from memory or session storage.
   */
  get CurrentProfile(): Profile {
    const stored = sessionStorage.getItem('currentProfile');
    if (this.currentProfile) return this.currentProfile;
    else if (stored) return new Profile(JSON.parse(stored));
    else return Profile.empty();
  }

  /**
   * Sets the current profile and updates session storage.
   */
  set CurrentProfile(profile: Profile | null) {
    if (!profile) {
      this.currentProfile = Profile.empty();
      sessionStorage.removeItem('currentProfile');
      return;
    } else {
      this.currentProfile = new Profile(profile);
      sessionStorage.setItem('currentProfile', JSON.stringify(profile));
    }
  }

  /**
   * Sets the access token and updates session storage.
   */
  set AccessToken(token: string | null) {
    if (!token) {
      sessionStorage.removeItem('token');
      this.access_token = null;
      return;
    }
    this.access_token = token;
    sessionStorage.setItem('token', token);
  }

  /**
   * Gets the access token from memory or session storage.
   */
  get AccessToken(): string | null {
    return this.access_token || sessionStorage.getItem('token');
  }
  /**
   * Sets the refresh token and updates session storage.
   */
  set RefreshToken(token: string | null) {
    if (!token) {
      sessionStorage.removeItem('refresh_token');
      this.refresh_token = null;
      return;
    }
    this.refresh_token = token;
    sessionStorage.setItem('refresh_token', token);
  }

  /**
   * Gets the refresh token from memory or session storage.
   */
  get RefreshToken(): string | null {
    return this.refresh_token || sessionStorage.getItem('refresh_token');
  }

  /**
   * Logs in a user with email and password.
   * @param email User email
   * @param password User password
   */
  async login(email: string, password: string): Promise<ApiResponse> {
    const body = { username: email, password: password };
    return await this.fetchData(this.LOGIN_URL, 'POST', body);
  }

  /**
   * Registers a new user.
   * @param email User email
   * @param password User password
   * @param repeatPassword Confirmation password
   */
  async register(email: string, password: string, repeatPassword: string): Promise<ApiResponse> {
    const body = { email: email, password: password, password2: repeatPassword };
    return await this.fetchData(this.REGISTER_URL, 'POST', body);
  }

  /**
   * Verifies user email with a token.
   * @param token Verification token
   */
  async verifyEmail(token: string): Promise<ApiResponse> {
    const url = `${this.VERIFY_URL}${token}/`;
    return await this.fetchData(url, 'GET');
  }

  /**
   * Requests a password reset for the given email.
   * @param email User email
   */
  async resetPassword(email: string): Promise<ApiResponse> {
    const body = { email: email };
    return await this.fetchData(this.RESET_URL, 'POST', body);
  }

  /**
   * Confirms password reset with token and new password.
   * @param token Reset token
   * @param password New password
   * @param confirmedPassword Confirmation password
   */
  async resetPasswordConfirm(token: string, password: string, confirmedPassword?: string): Promise<ApiResponse> {
    const body = { token: token, new_password: password, new_password2: confirmedPassword };
    return await this.fetchData(this.RESET_CONFIRM_URL, 'POST', body);
  }

  /**
   * Logs out the current user and clears session data.
   */
  async logout(): Promise<ApiResponse> {
    const body = { refresh_token: this.RefreshToken };
    try {
      const response = await this.directFetch(this.LOGOUT_URL, 'POST', body);
      if (!response.ok) {
        this.errorService.show('Logout failed. Please try again.');
        return response;
      }
      this.cleanup();
      return response;
    } catch (error) {
      this.errorService.show('An error occurred while logging out. Please try again.');
      return new ApiResponse(false, 500, 'Logout failed due to an error.');
    }
  }

  /**
   * Clears all authentication and user/profile state, resets session storage, and navigates to root.
   */
  private cleanup() {
    this.AccessToken = null;
    this.RefreshToken = null;
    this.CurrentUser = null;
    this.CurrentProfile = null;
    sessionStorage.clear();
    this.router.navigate(['/']);
  }

  /**
   * Refreshes the access token using the refresh token.
   */
  async refreshToken(): Promise<ApiResponse> {
    this.AccessToken = null;
    const body = { refresh: this.RefreshToken };
    return await this.directFetch(this.REFRESH_URL, 'POST', body);
  }

  /**
   * Gets the count of available video genres.
   */
  async getGenresCount(): Promise<ApiResponse> {
    const url = this.GENRES_COUNT_URL;
    return await this.fetchData(url, 'GET');
  }

  /**
   * Gets a list of videos, optionally filtered by parameters.
   * @param params Query parameters
   */
  async getVideos(params: string): Promise<ApiResponse> {
    const url = params ? `${this.VIDEOS_URL}?${params}` : this.VIDEOS_URL;
    return await this.fetchData(url, 'GET');
  }

  /**
   * Gets a video by its ID.
   * @param videoId Video ID
   */
  async getVideoById(videoId: string): Promise<ApiResponse> {
    const url = `${this.VIDEOS_URL}${videoId}/`;
    return await this.fetchData(url, 'GET');
  }

  /**
   * Updates the progress of a video for a profile.
   * @param profileId Profile ID
   * @param videoFileId Video file ID
   * @param progress Current progress in seconds
   */
  async updateVideoProgress(profileId: string, videoFileId: string, progress: number): Promise<ApiResponse> {
    const url = this.PROGRESS_UPDATE_URL(profileId, videoFileId);
    const body = { current_time: progress };
    return await this.fetchData(url, 'POST', body);
  }

  /**
   * Creates a new user profile.
   * @param name Profile name
   * @param isKid Is child profile
   * @param pictureFile Optional profile picture file
   */
  async createUserProfile(name: string, isKid: boolean, pictureFile?: File): Promise<ApiResponse> {
    const url = this.USER_PROFILES_URL;
    const language = '';
    const formData = new FormData();
    formData.append('profile_name', name);
    formData.append('is_kid', isKid.toString());
    formData.append('preferred_language', language);
    if (pictureFile) formData.append('profile_picture', pictureFile);
    return await this.fetchData(url, 'POST', formData);
  }

  /**
   * Edits an existing user profile.
   * @param profileId Profile ID
   * @param name New profile name
   * @param isKid Is child profile
   * @param pictureFile Optional profile picture file
   */
  async editUserProfile(profileId: string, name: string, isKid: boolean, pictureFile?: File): Promise<ApiResponse> {
    const url = `${this.USER_PROFILES_URL}${profileId}/`;
    const formData = new FormData();
    const selectedProfile = this.CurrentUser.profiles.find(p => p.id === profileId);
    formData.append('profile_id', profileId);
    if (name !== selectedProfile?.name) formData.append('profile_name', name);
    if (isKid !== selectedProfile?.kid) formData.append('is_kid', JSON.stringify(isKid));
    if (pictureFile) formData.append('profile_picture', pictureFile);
    return await this.fetchData(url, 'PATCH', formData);
  }

  /**
   * Deletes a user profile by ID.
   * @param profileId Profile ID
   */
  async deleteUserProfile(profileId: string): Promise<ApiResponse> {
    const url = `${this.USER_PROFILES_URL}${profileId}/`;
    return await this.fetchData(url, 'DELETE');
  }

  /**
   * Validates a JWT token by sending it to the backend for verification.
   * @param token The JWT token to validate.
   * @returns A promise resolving to an ApiResponse indicating whether the token is valid.
   */
  async validateToken(token: string): Promise<ApiResponse> {
    const body = { token: token };
    return await this.directFetch(this.VERIFY_TOKEN, 'POST', body);
  }

}
