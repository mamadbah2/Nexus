import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const sellerGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Check if user is logged in
  if (!authService.isLoggedIn()) {
    return router.createUrlTree(['/auth']);
  }

  // Check if user is a seller
  const userData = localStorage.getItem('currentUser');
  if (userData) {
    try {
      const user = JSON.parse(userData);
      if (user.role === 'SELLER') {
        return true;
      }
    } catch (error) {
      // Invalid user data, redirect to auth
      return router.createUrlTree(['/auth']);
    }
  }

  // Not a seller, redirect to products page
  return router.createUrlTree(['/products']);
};
