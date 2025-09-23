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
      'openProfileCreate',
      'openProfileEdit',
      'selectProfile',
      'closeProfileSelection',
      'openProfileSelection',
      'openConfirmationDialog'
    ], {
      profileSelectionData: profileSelectionData$.asObservable(),
      isProfileSelectionVisible: isProfileSelectionVisible$.asObservable(),
    });
    dialogService.openConfirmationDialog.and.returnValue(Promise.resolve(true));

    const realApiService = {
      createUserProfile: jasmine.createSpy(),
      editUserProfile: jasmine.createSpy(),
      deleteUserProfile: jasmine.createSpy(),
      CurrentUser: { profiles: [...profiles] },
      CurrentProfile: profiles[0]
    };
    apiService = realApiService as any;
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
    dialogService.openConfirmationDialog.and.returnValue(Promise.resolve(false));
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

  it('should not create profile if form is invalid', async () => {
    component.createProfileForm.setValue({ name: '', kid: false });
    await component.createProfile(component.createProfileForm.value);
    expect(apiService.createUserProfile).not.toHaveBeenCalled();
  });

  it('should not edit profile if form is invalid', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    component.createProfileForm.setValue({ name: '', kid: false });
    await component.editProfile(component.createProfileForm.value);
    expect(apiService.editUserProfile).not.toHaveBeenCalled();
  });

  it('should handle exception in editProfile', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    component.createProfileForm.setValue({ name: 'User1', kid: false });
    apiService.editUserProfile.and.rejectWith(new Error('fail'));
    try {
      await component.editProfile(component.createProfileForm.value);
    } catch (e) { }
    expect(errorService.show).toHaveBeenCalledWith('Error updating profile. Please try again later.');
  });

  it('should handle exception in deleteProfile', async () => {
    component.profileToEdit = createProfileMock('1', 'User1', false);
    spyOn(window, 'confirm').and.returnValue(true);
    apiService.deleteUserProfile.and.rejectWith(new Error('fail'));
    try {
      await component.deleteProfile();
    } catch (e) { }
    expect(errorService.show).toHaveBeenCalledWith('Error deleting profile. Please try again later.');
  });

  it('should not open edit profile dialog for invalid id', () => {
    component.profiles = profiles;
    const event = new Event('click');
    component.openEditProfile(event, 'invalid');
    expect(dialogService.openProfileEdit).not.toHaveBeenCalled();
  });

  it('should not select profile if undefined', () => {
    component.selectProfile(undefined as any);
    expect(dialogService.selectProfile).not.toHaveBeenCalled();
  });

  it('should create child profile successfully', async () => {
    const newProfile = createProfileMock('4', 'KidUser', true);
    apiService.createUserProfile.and.returnValue(Promise.resolve(createApiResponseMock(true, newProfile)));
    spyOn<any>(component, 'handleProfileCreation');
    component.createProfileForm.setValue({ name: 'KidUser', kid: true });
    await component.createProfile(component.createProfileForm.value);
    expect(apiService.createUserProfile).toHaveBeenCalledWith('KidUser', true, undefined);
    expect((component as any).handleProfileCreation).toHaveBeenCalled();
  });

  it('should unsubscribe and cleanup on destroy', () => {
    const sub = { unsubscribe: jasmine.createSpy('unsubscribe') };
    (component as any).subscriptions = [sub];
    component.profilePicPreview = 'preview';
    component.profilePicFile = new File(['dummy'], 'pic.png', { type: 'image/png' });
    component.createProfileForm.setValue({ name: 'User', kid: false });
    component.ngOnDestroy();
    expect(sub.unsubscribe).toHaveBeenCalled();
    expect(component.profilePicFile).toBeNull();
    expect(component.profilePicPreview).toBeNull();
    expect(component.createProfileForm.value.name).toBeNull();
  });

  it('should set profilesFull to false when profiles is empty', () => {
    const data = { profiles: [], mode: undefined, profileToEdit: undefined };
    profileSelectionData$.next(data);
    component.ngOnInit();
    expect(component.profilesFull).toBe(false);
    expect(component.mode).toBe('select');
    expect(component.profileToEdit).toBeNull();
  });

  it('should set profilesFull to true when profiles length >= MAX_PROFILES', () => {
    const profiles = Array((component as any).MAX_PROFILES).fill({ id: 1 });
    profileSelectionData$.next({ profiles });
    component.ngOnInit();
    expect(component.profilesFull).toBe(true);
  });

  it('should set profilePicPreview on reader.onload', () => {
    const mockResult = 'data:image/png;base64,xyz';
    class MockFileReader {
      result = mockResult;
      onload: Function | null = null;
      readAsDataURL() {
        if (this.onload) this.onload();
      }
    }
    spyOn(window as any, 'FileReader').and.returnValue(new MockFileReader());
    component.profilePicPreview = '';
    const file = new File(['dummy'], 'pic.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as any;
    component.onProfilePicUpload(event);
    expect(component.profilePicPreview).toBe(mockResult);
  });

  it('should add new profile and call closeCreateDialog', () => {
    const response = { data: createProfileMock('123', 'NewUser', false) };
    spyOn(component, 'closeCreateDialog');
    const initialLength = component.api.CurrentUser.profiles.length;
    (component as any)['handleProfileCreation'](response);
    expect(component.api.CurrentUser.profiles.length).toBe(initialLength + 1);
    expect(component.closeCreateDialog).toHaveBeenCalled();
  });

  it('should update profile if found and call closeCreateDialog', () => {
    const oldProfile = createProfileMock('1', 'User1', false);
    component.api.CurrentUser.profiles = [oldProfile];
    component.profileToEdit = createProfileMock('1', 'User1', false);
    const response = { data: createProfileMock('1', 'updated', false) };
    spyOn(component, 'closeCreateDialog');
    (component as any)['handleProfileUpdate'](response);
    expect(component.api.CurrentUser.profiles[0].name).toBe('updated');
    expect(component.closeCreateDialog).toHaveBeenCalled();
  });

  it('should call closeCreateDialog if profile not found', () => {
    component.api.CurrentUser.profiles = [createProfileMock('2', 'User2', false)];
    component.profileToEdit = createProfileMock('1', 'User1', false);
    const response = { data: createProfileMock('1', 'updated', false) };
    spyOn(component, 'closeCreateDialog');
    (component as any).handleProfileUpdate(response);
    expect(component.closeCreateDialog).toHaveBeenCalled();
  });

  it('should remove profile and update CurrentProfile if deleted', () => {
    const profile1 = createProfileMock('1', 'User1', false);
    const profile2 = createProfileMock('2', 'User2', false);
    component.api.CurrentUser.profiles = [profile1, profile2];
    component.profileToEdit = profile1;
    component.api.CurrentProfile = profile1;
    spyOn(component, 'closeCreateDialog');
    (component as any)['handleProfileDelete'](profile1);
    expect(component.api.CurrentUser.profiles.length).toBe(1);
    expect(component.api.CurrentProfile.id).toBe('2');
    expect(component.closeCreateDialog).toHaveBeenCalled();
  });

  it('should set CurrentProfile to null if no profiles remain after delete', () => {
    const profile1 = createProfileMock('1', 'User1', false);
    component.api.CurrentUser.profiles = [profile1];
    component.profileToEdit = profile1;
    component.api.CurrentProfile = profile1;
    spyOn(component, 'closeCreateDialog');
    (component as any).handleProfileDelete(profile1);
    expect(component.api.CurrentUser.profiles.length).toBe(0);
    expect(component.api.CurrentProfile).toBeNull();
    expect(component.closeCreateDialog).toHaveBeenCalled();
  });

  it('should return early if profileToEdit is not set in update/delete', () => {
    component.profileToEdit = null;
    spyOn(component, 'closeCreateDialog');
    expect(() => (component as any)['handleProfileUpdate']({ data: createProfileMock('1', 'User1', false) })).not.toThrow();
    expect(() => (component as any)['handleProfileDelete'](createProfileMock('1', 'User1', false))).not.toThrow();
  });

  it('should call URL.revokeObjectURL only if profilePicPreview is set', () => {
    component.profilePicPreview = 'blob:url';
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    component.ngOnDestroy();
    expect(revokeSpy).toHaveBeenCalledWith('blob:url');
  });

  it('should not call URL.revokeObjectURL if profilePicPreview is not set', () => {
    component.profilePicPreview = '';
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    component.ngOnDestroy();
    expect(revokeSpy).not.toHaveBeenCalled();
  });

  it('should revokeObjectURL in closeCreateDialog if profilePicPreview is set', () => {
    component.profilePicPreview = 'blob:url';
    const revokeSpy = spyOn(URL, 'revokeObjectURL');
    component.closeCreateDialog();
    expect(revokeSpy).toHaveBeenCalledWith('blob:url');
  });

  it('should set profiles to empty array if profiles is undefined in profileSelectionData', () => {
    const data = { profiles: undefined, mode: 'select', profileToEdit: undefined };
    profileSelectionData$.next(data);
    component.ngOnInit();
    expect(component.profiles).toEqual([]);
  });

  it('should return early in deleteProfile if profileToEdit is not set', async () => {
    component.profileToEdit = null;
    spyOn(window, 'confirm').and.returnValue(true);
    await component.deleteProfile();
    expect(apiService.deleteUserProfile).not.toHaveBeenCalled();
    expect(errorService.show).not.toHaveBeenCalled();
  });
});
