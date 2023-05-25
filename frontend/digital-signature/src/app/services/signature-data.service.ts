import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SignatureDataService {

  constructor() { }

  myPublicKey: string = '';
  myGeneratedSignature = '';

}
