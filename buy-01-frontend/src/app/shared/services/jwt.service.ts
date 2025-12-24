import { Injectable } from '@angular/core';

export interface JwtPayload {
  userID: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root'
})
export class JwtService {

  /**
   * Decode a JWT token and return the payload
   * @param token - The JWT token to decode
   * @returns The decoded payload or null if invalid
   */
  decodeToken(token: string): JwtPayload | null {
    try {
      if (!token || token.split('.').length !== 3) {
        return null;
      }

      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload) as JwtPayload;
    } catch (error) {
      console.error('Error decoding JWT token:', error);
      return null;
    }
  }

  /**
   * Get user ID from JWT token
   * @param token - The JWT token
   * @returns User ID or null if not found
   */
  getUserId(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.userID || null;
  }

  /**
   * Get user email from JWT token
   * @param token - The JWT token
   * @returns User email or null if not found
   */
  getUserEmail(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.email || null;
  }

  /**
   * Get user role from JWT token
   * @param token - The JWT token
   * @returns User role or null if not found
   */
  getUserRole(token: string): string | null {
    const payload = this.decodeToken(token);
    return payload?.role || null;
  }

  /**
   * Check if JWT token is expired
   * @param token - The JWT token
   * @returns True if expired, false otherwise
   */
  isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  }

  /**
   * Check if token is valid (not expired and properly formatted)
   * @param token - The JWT token
   * @returns True if valid, false otherwise
   */
  isTokenValid(token: string): boolean {
    if (!token) {
      return false;
    }

    const payload = this.decodeToken(token);
    return payload !== null && !this.isTokenExpired(token);
  }

  /**
   * Get token expiration date
   * @param token - The JWT token
   * @returns Date object or null if not found
   */
  getTokenExpirationDate(token: string): Date | null {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return null;
    }

    return new Date(payload.exp * 1000);
  }

  /**
   * Get time remaining until token expires (in seconds)
   * @param token - The JWT token
   * @returns Seconds until expiration or 0 if expired/invalid
   */
  getTimeUntilExpiration(token: string): number {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return 0;
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const timeRemaining = payload.exp - currentTime;
    return Math.max(0, timeRemaining);
  }
}
