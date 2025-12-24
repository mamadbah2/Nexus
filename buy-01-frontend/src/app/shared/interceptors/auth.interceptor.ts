import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Add authorization header if token exists
    const token = this.authService.getToken();
    if (token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Handle 401 Unauthorized responses
        if (error.status === 401) {
          console.log('401 Unauthorized response received, logging out user');

          // Clear authentication state immediately
          this.authService.logout();

          // Navigate to products page
          this.router.navigate(['/auth']).then(() => {
            // Optional: Show a message to the user
            console.log('Session expired. Please log in again.');
          });
        }

        // Handle 403 Forbidden responses
        if (error.status === 403) {
          console.log('403 Forbidden response - insufficient permissions');
        }

        return throwError(() => error);
      })
    );
  }
}
