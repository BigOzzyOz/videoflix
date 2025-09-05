import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProfileSelectionComponent } from './profile-selection.component';
import { DialogService } from '../../../services/dialog.service';
import { ApiService } from '../../../services/api.service';
import { ErrorService } from '../../../services/error.service';
import { Profile } from '../../../models/profile';
import { of, Subject } from 'rxjs';

describe('ProfileSelectionComponent', () => {
  let component: ProfileSelectionComponent;
  let fixture: ComponentFixture<ProfileSelectionComponent>;
  let dialogService: jasmine.SpyObj<DialogService>;
  let apiService: jasmine.SpyObj<ApiService>;
  let errorService: jasmine.SpyObj<ErrorService>;
  let profiles: Profile[];
  let profileSelectionData$: Subject<any>;
  let isProfileSelectionVisible$: Subject<boolean>;

  function createProfileMock(id: string, name: string, kid: boolean): Profile {
    return {
      id,
      name,
      kid,
      profilePic: null,
      language: 'en',
      videoProgress: [],
      watchStats: {
        totalVideosStarted: 0,
        totalVideosCompleted: 0,
        totalCompletions: 0,
        totalWatchTime: 0,
        uniqueVideosWatched: 0,
        completionRate: 0,
      },
      getDisplayName: () => name,
      isChildProfile: () => kid,
      getProfileImage: () => '',
      toApiFormat: () => ({
        id,
        profile_name: name,
        profile_picture: null,
        profile_picture_url: null,
        is_kid: kid,
        preferred_language: 'en',
        video_progress: [],
        watch_statistics: {
          total_videos_started: 0,
          total_videos_completed: 0,
          total_completions: 0,
          total_watch_time: 0,
          unique_videos_watched: 0,
          completion_rate: 0
        }
      })
    };
  }

  function createApiResponseMock(ok: boolean, data: any): any {
    return {
      ok,
      status: ok ? 200 : 400,
      data,
      message: '',
      isClientError: () => !ok,
      isServerError: () => false,
      isSuccess: () => ok
    };
  }

  beforeEach(async () => {
    profiles = [
      createProfileMock('1', 'User1', false),
      createProfileMock('2', 'User2', true)
    ];
    profileSelectionData$ = new Subject();
    isProfileSelectionVisible$ = new Subject();
    dialogService = jasmine.createSpyObj('DialogService', [
      'openProfileCreate', 'openProfileEdit', 'selectProfile', 'closeProfileSelection', 'openProfileSelection'
    ], {
      profileSelectionData: profileSelectionData$.asObservable(),
      isProfileSelectionVisible: isProfileSelectionVisible$.asObservable()
    });
    apiService = jasmine.createSpyObj('ApiService', [
      'createUserProfile', 'editUserProfile', 'deleteUserProfile'
    ], {
      CurrentUser: { profiles: [...profiles] },
      CurrentProfile: profiles[0]
    });
    errorService = jasmine.createSpyObj('ErrorService', ['show']);

    await TestBed.configureTestingModule({
      imports: [ProfileSelectionComponent],
      providers: [
        { provide: DialogService, useValue: dialogService },
        { provide: ApiService, useValue: apiService },
        { provide: ErrorService, useValue: errorService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should subscribe to dialog visibility and profile data', () => {
    isProfileSelectionVisible$.next(true);
    profileSelectionData$.next({ profiles, mode: 'select' });
    expect(component.isVisible).toBeTrue();
    expect(component.profiles.length).toBe(2);
    expect(component.mode).toBe('select');
  });

  it('should open create profile dialog', () => {
    component.openCreateProfile();
    expect(dialogService.openProfileCreate).toHaveBeenCalled();
  });

  it('should handle profile picture upload', () => {
    const file = new File(['dummy'], 'pic.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as any;
    spyOn(window, 'FileReader').and.returnValue({
      readAsDataURL: () => { component.profilePicPreview = 'data:image/png;base64,dummy'; },
      onload: null,
      result: 'data:image/png;base64,dummy'
    } as any);
    component.onProfilePicUpload(event);
    expect(component.profilePicFile).toBe(file);
  });

  it('should create profile successfully', async () => {
    const newProfile = createProfileMock('3', 'User3', false);
    apiService.createUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(true, newProfile)));
    spyOn<any>(component, 'handleProfileCreation');
    component.createProfileForm.setValue({ name: 'User3', kid: false });
    await component.createProfile(component.createProfileForm.value);
    expect(apiService.createUserProfile).toHaveBeenCalledWith('User3', false, undefined);
    expect((component as any).handleProfileCreation).toHaveBeenCalled();
  });

  it('should handle create profile error', async () => {
    apiService.createUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(false, null)));
    component.createProfileForm.setValue({ name: 'User3', kid: false });
    await component.createProfile(component.createProfileForm.value);
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should handle create profile exception', async () => {
    apiService.createUserProfile.and.rejectWith(new Error('fail'));
    component.createProfileForm.setValue({ name: 'User3', kid: false });
    await component.createProfile(component.createProfileForm.value);
    expect(errorService.show).toHaveBeenCalledWith('Error creating profile. Please try again later.');
  });

  it('should edit profile successfully', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    apiService.editUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(true, component.profileToEdit)));
    spyOn<any>(component, 'handleProfileUpdate');
    component.createProfileForm.setValue({ name: 'User1', kid: false });
    await component.editProfile(component.createProfileForm.value);
    expect(apiService.editUserProfile).toHaveBeenCalledWith('1', 'User1', false, undefined);
    expect((component as any).handleProfileUpdate).toHaveBeenCalled();
  });

  it('should handle edit profile error', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    apiService.editUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(false, null)));
    component.createProfileForm.setValue({ name: 'User1', kid: false });
    await component.editProfile(component.createProfileForm.value);
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should delete profile successfully', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    spyOn(window, 'confirm').and.returnValue(true);
    apiService.deleteUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(true, null)));
    spyOn<any>(component, 'handleProfileDelete');
    await component.deleteProfile();
    expect(apiService.deleteUserProfile).toHaveBeenCalledWith('1');
    expect((component as any).handleProfileDelete).toHaveBeenCalledWith(component.profileToEdit);
  });

  it('should handle delete profile error', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    spyOn(window, 'confirm').and.returnValue(true);
    apiService.deleteUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(false, null)));
    await component.deleteProfile();
    expect(errorService.show).toHaveBeenCalled();
  });

  it('should not delete profile if not confirmed', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    spyOn(window, 'confirm').and.returnValue(false);
    await component.deleteProfile();
    expect(apiService.deleteUserProfile).not.toHaveBeenCalled();
  });

  it('should select profile', () => {
    const profile = createProfileMock('1', 'User1', false);
    component.selectProfile(profile);
    expect(dialogService.selectProfile).toHaveBeenCalledWith(profile);
  });

  it('should open edit profile dialog', () => {
    dialogService.openProfileEdit.calls.reset();
    component.profiles = profiles;
    const event = new Event('click');
    component.openEditProfile(event, '1');
    expect(dialogService.openProfileEdit).toHaveBeenCalledWith(profiles[0]);
  });

  it('should close dialog', () => {
    component.closeDialog();
    expect(dialogService.closeProfileSelection).toHaveBeenCalled();
  });

  it('should close create dialog', () => {
    dialogService.openProfileSelection.calls.reset();
    component.closeCreateDialog();
    expect(dialogService.openProfileSelection).toHaveBeenCalled();
  });
});
