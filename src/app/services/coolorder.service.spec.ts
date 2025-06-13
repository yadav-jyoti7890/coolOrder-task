import { TestBed } from '@angular/core/testing';

import { CoolorderService } from './coolorder.service';

describe('CoolorderService', () => {
  let service: CoolorderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CoolorderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
