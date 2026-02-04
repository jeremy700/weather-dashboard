import { TestBed } from '@angular/core/testing';

import { Wather } from './wather';

describe('Wather', () => {
  let service: Wather;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Wather);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
