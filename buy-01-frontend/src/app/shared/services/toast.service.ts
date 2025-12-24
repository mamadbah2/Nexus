import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastsSubject = new BehaviorSubject<Toast[]>([]);
  public toasts$ = this.toastsSubject.asObservable();

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  private addToast(toast: Omit<Toast, 'id' | 'timestamp'>): void {
    const newToast: Toast = {
      ...toast,
      id: this.generateId(),
      timestamp: new Date(),
      duration: toast.duration || this.getDefaultDuration(toast.type)
    };

    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next([...currentToasts, newToast]);

    // Auto remove toast after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(newToast.id);
      }, newToast.duration);
    }
  }

  private getDefaultDuration(type: Toast['type']): number {
    switch (type) {
      case 'success':
        return 4000;
      case 'info':
        return 5000;
      case 'warning':
        return 6000;
      case 'error':
        return 8000;
      default:
        return 5000;
    }
  }

  success(title: string, message: string, duration?: number): void {
    this.addToast({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number): void {
    this.addToast({ type: 'error', title, message, duration });
  }

  warning(title: string, message: string, duration?: number): void {
    this.addToast({ type: 'warning', title, message, duration });
  }

  info(title: string, message: string, duration?: number): void {
    this.addToast({ type: 'info', title, message, duration });
  }

  removeToast(id: string): void {
    const currentToasts = this.toastsSubject.value;
    this.toastsSubject.next(currentToasts.filter(toast => toast.id !== id));
  }

  clearAll(): void {
    this.toastsSubject.next([]);
  }

  // Convenience methods for common file upload errors
  fileSizeError(fileName: string, maxSize: string): void {
    this.error(
      'File Too Large',
      `"${fileName}" exceeds the maximum size limit of ${maxSize}. Please choose a smaller file.`
    );
  }

  fileCountError(maxCount: number): void {
    this.error(
      'Too Many Files',
      `You can only upload a maximum of ${maxCount} images. Please remove some files and try again.`
    );
  }

  fileTypeError(fileName: string, allowedTypes: string[]): void {
    this.error(
      'Invalid File Type',
      `"${fileName}" is not a supported image format. Please use: ${allowedTypes.join(', ')}.`
    );
  }

  uploadSuccess(fileName: string): void {
    this.success(
      'Upload Successful',
      `"${fileName}" has been uploaded successfully.`
    );
  }

  uploadError(fileName: string, error?: string): void {
    this.error(
      'Upload Failed',
      `Failed to upload "${fileName}". ${error || 'Please try again.'}`
    );
  }

  productCreated(productName: string): void {
    this.success(
      'Product Created',
      `"${productName}" has been created successfully!`
    );
  }

  productUpdated(productName: string): void {
    this.success(
      'Product Updated',
      `"${productName}" has been updated successfully!`
    );
  }

  productDeleted(productName: string): void {
    this.success(
      'Product Deleted',
      `"${productName}" has been deleted successfully.`
    );
  }

  networkError(): void {
    this.error(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection and try again.'
    );
  }

  authError(): void {
    this.error(
      'Authentication Error',
      'Your session has expired. Please log in again.'
    );
  }

  serverError(): void {
    this.error(
      'Server Error',
      'Something went wrong on our end. Please try again later.'
    );
  }

  // Convenience methods with simple message parameter
  showSuccess(message: string, duration?: number): void {
    this.success('Success', message, duration);
  }

  showError(message: string, duration?: number): void {
    this.error('Error', message, duration);
  }

  showWarning(message: string, duration?: number): void {
    this.warning('Warning', message, duration);
  }

  showInfo(message: string, duration?: number): void {
    this.info('Info', message, duration);
  }
}
