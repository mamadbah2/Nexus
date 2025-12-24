import { Component } from "@angular/core";
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { AuthService } from "../../services/auth.service";
import { Router } from "@angular/router";
import { LoginResponse } from "../../models/login.response";
import { User } from "../../../shared/components/navbar/navbar.component";

@Component({
  selector: "app-sign-in",
  imports: [ReactiveFormsModule],
  templateUrl: "./sign-in.component.html",
  styleUrls: ["./sign-in.component.css", "../sign/sign.component.css"],
})
export class SignInComponent {
  loginForm = new FormGroup({
    email: new FormControl("", [Validators.required, Validators.email]),
    password: new FormControl("", [
      Validators.required,
      Validators.minLength(3),
    ]),
  });

  error_message: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
  ) {}

  onSubmit() {
    if (this.loginForm.valid) {
      this.authService
        .login(this.loginForm.value as { email: string; password: string })
        .subscribe({
          next: (loginResponse: LoginResponse) => {
            this.authService.setToken(loginResponse.token);
            console.log("loginResponse", loginResponse);
            // Fetch complete user data from backend
            this.authService.getCurrentUser().subscribe({
              next: (userResponse) => {
                console.log("uswerResponse", userResponse);
                // Store user data in
                const userData: User = {
                  id: userResponse.id || userResponse.email,
                  email: userResponse.email,
                  role:
                    userResponse.role === "SELLER" ||
                    userResponse.role?.includes("SELLER")
                      ? ("SELLER" as const)
                      : ("CLIENT" as const),
                  name: userResponse.name,
                };
                localStorage.setItem("currentUser", JSON.stringify(userData));

                // Dispatch custom event to notify navbar of auth state change
                window.dispatchEvent(
                  new CustomEvent("authStateChanged", {
                    detail: { loggedIn: true, user: userData },
                  }),
                );
                this.router.navigate(["/"]).then();
              },
              error: (err) => {
                console.warn("Failed to fetch user details after login:", err);
              },
            });
          },
          error: (err) => {
            console.warn("Login failed:", err);
            if (err.status === 401) {
              this.error_message = "Invalid email or password";
            } else if (err.status === 403) {
              this.error_message = "Access forbidden. Please contact support.";
            } else {
              this.error_message = "An unexpected error occurred. Please try again.";
            }
            setTimeout(() => (this.error_message = null), 2000);
          },
        });
    }
  }
}
