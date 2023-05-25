import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DigitalSignatureComponent } from './components/digital-signature/digital-signature.component';
import { SignComponent } from './components/sign/sign.component';
import { ValidateComponent } from './components/validate/validate.component';
import { NotFoundComponent } from './components/not-found/not-found.component';

const routes: Routes = [
  {path:'', redirectTo:'digital-signature', pathMatch:'full'},
  {path:'digital-signature', component:DigitalSignatureComponent},
  {path:'sign', component:SignComponent},
  {path:'validate', component:ValidateComponent},
  {path:'**', component:NotFoundComponent}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
