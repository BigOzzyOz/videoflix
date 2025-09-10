import { TestBed } from '@angular/core/testing';
import { DialogService } from './dialog.service';
import { Profile } from '../models/profile';
import { DialogData } from '../interfaces/dialog-data';

describe('DialogService', () => {
  let service: DialogService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DialogService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit dialog visibility and data on openProfileSelection', async () => {
    const profiles = [Profile.empty(), Profile.empty()];
    let visible: boolean | undefined;
    let data: DialogData | null | undefined;
    service.isProfileSelectionVisible.subscribe(v => visible = v);
    service.profileSelectionData.subscribe(d => data = d);
    const promise = service.openProfileSelection(profiles);
    expect(visible).toBeTrue();
    expect(data?.profiles).toEqual(profiles);
    expect(data?.mode).toBe('select');
    service.selectProfile(profiles[0]);
    const result = await promise;
    expect(result).toBe(profiles[0]);
  });

  it('should emit dialog visibility and data on openProfileCreate', async () => {
    let visible: boolean | undefined;
    let data: DialogData | null | undefined;
    service.isProfileSelectionVisible.subscribe(v => visible = v);
    service.profileSelectionData.subscribe(d => data = d);
    const promise = service.openProfileCreate();
    expect(visible).toBeTrue();
    expect(data?.mode).toBe('create');
    const profile = Profile.empty();
    service.selectProfile(profile);
    const result = await promise;
    expect(result).toBe(profile);
  });

  it('should emit dialog visibility and data on openProfileEdit', async () => {
    const profile = Profile.empty();
    let visible: boolean | undefined;
    let data: DialogData | null | undefined;
    service.isProfileSelectionVisible.subscribe(v => visible = v);
    service.profileSelectionData.subscribe(d => data = d);
    const promise = service.openProfileEdit(profile);
    expect(visible).toBeTrue();
    expect(data?.mode).toBe('edit');
    expect(data?.profileToEdit).toBe(profile);
    service.selectProfile(profile);
    const result = await promise;
    expect(result).toBe(profile);
  });

  it('should reset dialog state on closeProfileSelection', () => {
    service.closeProfileSelection();
    let visible: boolean | undefined;
    let data: DialogData | null | undefined;
    let result: Profile | null | undefined;
    service.isProfileSelectionVisible.subscribe(v => visible = v);
    service.profileSelectionData.subscribe(d => data = d);
    service.profileSelectionResult.subscribe(r => result = r);
    expect(visible).toBeFalse();
    expect(data).toBeNull();
    expect(result).toBeNull();
  });
});
