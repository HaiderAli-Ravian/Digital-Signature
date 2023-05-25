import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SignatureDataService } from 'src/app/services/signature-data.service';

@Component({
  selector: 'app-validate',
  templateUrl: './validate.component.html',
  styleUrls: ['./validate.component.css']
})
export class ValidateComponent {

  constructor(
    private http: HttpClient,
    private router: Router,
    private SignatureData: SignatureDataService
  ) { }

  newConvertedString: string = '';
  publicKey: string = this.SignatureData.myPublicKey;
  generatedSignature:string = this.SignatureData.myGeneratedSignature;
  verificationStatus:boolean = false;
  applyValidation:boolean = false;

  async openFileBrowser(): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';

      fileInput.addEventListener('change', (event: any) => {
        const file = event.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
          const base64String = reader.result as string;
          const convertedString = base64String.split(',')[1];
          resolve(convertedString); // Resolve the converted string
        };

        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      fileInput.click();
    });
  }

  async convertFileToString(): Promise<void> {
    try {
      this.newConvertedString = await this.openFileBrowser();
      this.newConvertedString = this.newConvertedString.substring(0, 1000); // Truncate the string to the first 1000 characters

    } catch (error) {
      console.error(error); // Handle any errors
    }
  }


  validate() {
    this.http
      .post<any>('http://localhost:3000/verifyDocument', { convertedString:this.newConvertedString, publicKey: this.publicKey, generatedSignature: this.generatedSignature}).subscribe(
        (res:any) => {
          this.verificationStatus = res.documentVerificationStatus;
          // debugger
          // console.log(verificationStatus)
          this.applyValidation = true;
        },
        (err) => {
          console.log(err)
        }
      );

  }


}
