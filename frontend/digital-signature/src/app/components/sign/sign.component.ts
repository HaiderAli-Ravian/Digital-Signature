import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SignatureDataService } from 'src/app/services/signature-data.service';

@Component({
  selector: 'app-sign',
  templateUrl: './sign.component.html',
  styleUrls: ['./sign.component.css']
})
export class SignComponent implements OnInit {

  public publicKey: string = '';
  public privateKey: string = '';
  public convertedString: string = '';
  public generatedSignature = '';



  constructor(
    private http: HttpClient,
    private router: Router,
    private SignatureData: SignatureDataService
  ) { }



  ngOnInit(): void {
    this.generateKey();
  }



  generateKey(): void {
    this.http.get('http://localhost:3000/generate-key-pair').subscribe(
      (res: any) => {
        this.publicKey = res.publickey;
        this.privateKey = res.privatekey;
      },
      (err) => {
        console.log(err);
      }
    );
  }




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
      this.convertedString = await this.openFileBrowser();
      this.convertedString = this.convertedString.substring(0, 1000); // Truncate the string to the first 1000 characters
    } catch (error) {
      console.error(error); // Handle any errors
    }
  }
  


  sign() {
    this.http
      .post<any>('http://localhost:3000/sign', { convertedString:this.convertedString, privateKey: this.privateKey }).subscribe(
        (res:any) => {
          this.generatedSignature = res.signature;

          this.SignatureData.myPublicKey = this.publicKey;
          this.SignatureData.myGeneratedSignature = this.generatedSignature;
        },
        (err) => {
          console.log(err)
        }
      );

  }




}
