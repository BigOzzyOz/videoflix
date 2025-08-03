import { TestBed } from '@angular/core/testing';

import { PlayerStateService } from './player-state.service';

describe('PlayerStateService', () => {
  let service: PlayerStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlayerStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
