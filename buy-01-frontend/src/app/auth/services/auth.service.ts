import { Injectable } from "@angular/core";
import { catchError, Observable, of, switchMap, throwError } from "rxjs";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { LoginResponse } from "../models/login.response";
import { User } from "../models/user";
import { MediaResponse } from "../models/media.response";
import { Router } from "@angular/router";
import { environment } from "../../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private isAuthenticate: boolean = false;
  private tokenCheckInterval: any;

  constructor(
    private httpClient: HttpClient,
    private router: Router,
  ) {
    this.isAuthenticate = this.validateToken();
    this.startTokenValidation();
  }

  login(credentials: { email: string; password: string }): Observable<any> {
    return this.httpClient
      .post(`${this.apiUrl}/api/users/login`, credentials, {
        headers: new HttpHeaders({
          Accept: "application/json",
        }),
      })
      .pipe(catchError((err) => throwError(() => err)));
  }

  register(dataForm: any, file: any): Observable<any> {
    const user: User = {
      name: `${dataForm.firstName} ${dataForm.lastName}`,
      email: dataForm.email,
      password: dataForm.password,
      role: dataForm.isSeller ? "SELLER" : "CLIENT",
      avatar: "path/to/image",
    };

    if (file) {
      console.log("We have file");
      const formData = new FormData();
      formData.set("file", file, file.name);

      let xender: Observable<any> = this.httpClient.post(
        `${this.apiUrl}/api/media`,
        formData,
      );

      return xender.pipe(
        switchMap((rep) => {
          console.log(rep);
          user.avatar = rep?.imageUrl;
          return this.httpClient
            .post(`${this.apiUrl}/api/users`, user)
            .pipe(catchError((err) => throwError(() => err)));
        }),
        catchError((err) => throwError(() => err)),
      );
    }

    return this.httpClient
      .post(`${this.apiUrl}/api/users`, user)
      .pipe(catchError((err) => throwError(() => err)));
  }

  setToken(token: string) {
    localStorage.setItem("access_token", token);
    this.isAuthenticate = true;
    this.startTokenValidation();
  }

  logout(): void {
    // Stop token validation
    this.stopTokenValidation();

    // Clear all authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("refreshToken");
    sessionStorage.clear();
    this.isAuthenticate = false;

    // Dispatch custom event to notify of logout
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { loggedIn: false, user: null },
      }),
    );

    // Clear any cached data
    window.dispatchEvent(new Event("storage"));
  }

  isLoggedIn() {
    return this.validateToken();
  }

  getToken(): string | null {
    return localStorage.getItem("access_token");
  }

  getCurrentUser(): Observable<any> {
    const token = this.getToken();
    if (!token) {
      return throwError(() => new Error("No token found"));
    }

    try {
      // Decode JWT token to get user data - no API call needed
      const payload = this.decodeJwtToken(token);
      if (!payload) {
        return throwError(() => new Error("Invalid token"));
      }

      const userData = {
        id: payload.userID,
        email: payload.sub,
        role: payload.authorities,
        name: payload.name || payload.sub.split("@")[0],
      };

      console.log("userData:===========", userData);

      return of(userData);
    } catch (error) {
      return throwError(() => new Error("Failed to decode token"));
    }
  }

  private decodeJwtToken(token: string): any {
    try {
      const payload = token.split(".")[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  }

  triggerAuthStateRefresh(): void {
    // Trigger a custom event to refresh auth state in components
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { refresh: true },
      }),
    );
  }

  private validateToken(): boolean {
    const token = this.getToken();
    if (!token) {
      this.isAuthenticate = false;
      return false;
    }

    try {
      const payload = this.decodeJwtToken(token);
      if (!payload || !payload.exp) {
        this.handleInvalidToken();
        return false;
      }

      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      const currentTime = Math.floor(Date.now() / 1000);
      if (payload.exp <= currentTime) {
        console.log("Token expired, logging out automatically");
        this.handleInvalidToken();
        return false;
      }

      this.isAuthenticate = true;
      return true;
    } catch (error) {
      console.error("Token validation error:", error);
      this.handleInvalidToken();
      return false;
    }
  }

  private handleInvalidToken(): void {
    console.log(
      "Invalid or expired token detected, clearing authentication state",
    );
    this.isAuthenticate = false;

    // Clear authentication data
    localStorage.removeItem("access_token");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userRole");
    localStorage.removeItem("refreshToken");

    // Stop token validation
    this.stopTokenValidation();

    // Notify components of auth state change
    window.dispatchEvent(
      new CustomEvent("authStateChanged", {
        detail: { loggedIn: false, user: null, reason: "token_invalid" },
      }),
    );

    // Trigger storage event for cross-tab sync
    window.dispatchEvent(new Event("storage"));
  }

  private startTokenValidation(): void {
    // Stop any existing interval
    this.stopTokenValidation();

    // Check token validity every 30 seconds
    this.tokenCheckInterval = setInterval(() => {
      if (!this.validateToken()) {
        // Token is invalid, user will be automatically logged out
        console.log("Periodic token check failed, user logged out");
      }
    }, 30000);
  }

  private stopTokenValidation(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
      this.tokenCheckInterval = null;
    }
  }
}
