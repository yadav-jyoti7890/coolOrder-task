import { TestBed } from '@angular/core/testing';

import { AddInputService } from './add-input.service';

describe('AddInputService', () => {
  let service: AddInputService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AddInputService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
