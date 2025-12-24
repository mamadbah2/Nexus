import { Component } from '@angular/core';
import { SignUpComponent } from "../sign-up/sign-up.component";
import { SignInComponent } from "../sign-in/sign-in.component";
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sign',
  imports: [SignUpComponent, SignInComponent, CommonModule],
  templateUrl: './sign.component.html',
  styleUrl: './sign.component.css'
})
export class SignComponent {
  isSignIn: boolean = true;

  toggleSignIn() {
    this.isSignIn = !this.isSignIn;
  }

  signUpDone(isSignUpDone: boolean) {
    this.isSignIn = isSignUpDone;
  }
}
