import { TestBed } from '@angular/core/testing';

import { SignatureDataService } from './signature-data.service';

describe('SignatureDataService', () => {
  let service: SignatureDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SignatureDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
