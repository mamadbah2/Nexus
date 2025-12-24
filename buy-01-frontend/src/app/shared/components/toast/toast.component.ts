import { Component, OnInit, OnDestroy } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  trigger,
  state,
  style,
  transition,
  animate,
} from "@angular/animations";
import { ToastService, Toast } from "../../services/toast.service";
import { Subscription } from "rxjs";

@Component({
  selector: "app-toast",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        class="toast"
        [ngClass]="getToastClass(toast.type)"
        [@slideIn]
      >
        <div class="toast-icon">
          <svg
            *ngIf="toast.type === 'success'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <polyline points="20,6 9,17 4,12"></polyline>
          </svg>
          <svg
            *ngIf="toast.type === 'error'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
          <svg
            *ngIf="toast.type === 'warning'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path
              d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"
            ></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
          <svg
            *ngIf="toast.type === 'info'"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>

        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div class="toast-message">{{ toast.message }}</div>
        </div>

        <button
          class="toast-close"
          (click)="removeToast(toast.id)"
          type="button"
          aria-label="Close notification"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div
          class="toast-progress"
          [style.animation-duration]="toast.duration + 'ms'"
        ></div>
      </div>
    </div>
  `,
  styles: [
    `
      .toast-container {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
        max-width: 400px;
        width: 100%;
      }

      .toast {
        position: relative;
        display: flex;
        align-items: flex-start;
        gap: 0.75rem;
        padding: 1rem;
        background: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
        border: 1px solid var(--border-primary);
        backdrop-filter: blur(10px);
        animation: slideIn 0.3s ease-out;
        overflow: hidden;
      }

      .toast.success {
        border-left: 4px solid var(--accent-green);
      }

      .toast.error {
        border-left: 4px solid var(--accent-red);
      }

      .toast.warning {
        border-left: 4px solid var(--accent-yellow);
      }

      .toast.info {
        border-left: 4px solid var(--primary-500);
      }

      .toast-icon {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        margin-top: 0.125rem;
      }

      .toast.success .toast-icon {
        color: var(--accent-green);
      }

      .toast.error .toast-icon {
        color: var(--accent-red);
      }

      .toast.warning .toast-icon {
        color: var(--accent-yellow);
      }

      .toast.info .toast-icon {
        color: var(--primary-500);
      }

      .toast-content {
        flex: 1;
        min-width: 0;
      }

      .toast-title {
        font-weight: var(--font-semibold);
        font-size: var(--text-sm);
        color: var(--text-primary);
        margin-bottom: 0.25rem;
        font-family: "Poppins", sans-serif;
      }

      .toast-message {
        font-size: var(--text-sm);
        color: var(--text-secondary);
        line-height: 1.4;
        word-break: break-word;
      }

      .toast-close {
        flex-shrink: 0;
        width: 20px;
        height: 20px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-tertiary);
        transition: color var(--transition-fast);
        margin-top: 0.125rem;
      }

      .toast-close:hover {
        color: var(--text-secondary);
      }

      .toast-progress {
        position: absolute;
        bottom: 0;
        left: 0;
        height: 3px;
        background: currentColor;
        width: 100%;
        transform-origin: left;
        animation: progress linear;
        opacity: 0.3;
      }

      .toast.success .toast-progress {
        color: var(--accent-green);
      }

      .toast.error .toast-progress {
        color: var(--accent-red);
      }

      .toast.warning .toast-progress {
        color: var(--accent-yellow);
      }

      .toast.info .toast-progress {
        color: var(--primary-500);
      }

      @keyframes slideIn {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      @keyframes progress {
        from {
          transform: scaleX(1);
        }
        to {
          transform: scaleX(0);
        }
      }

      @media (max-width: 640px) {
        .toast-container {
          top: 0.5rem;
          right: 0.5rem;
          left: 0.5rem;
          max-width: none;
        }

        .toast {
          padding: 0.875rem;
        }

        .toast-title {
          font-size: var(--text-xs);
        }

        .toast-message {
          font-size: var(--text-xs);
        }
      }

      /* Dark mode support */
      @media (prefers-color-scheme: dark) {
        .toast {
          background: var(--background-secondary);
          border-color: var(--border-secondary);
        }
      }

      /* Reduce motion for accessibility */
      @media (prefers-reduced-motion: reduce) {
        .toast {
          animation: none;
        }

        .toast-progress {
          animation: none;
        }
      }
    `,
  ],
  animations: [
    trigger("slideIn", [
      transition(":enter", [
        style({ transform: "translateX(100%)", opacity: 0 }),
        animate(
          "300ms ease-out",
          style({ transform: "translateX(0)", opacity: 1 }),
        ),
      ]),
      transition(":leave", [
        animate(
          "200ms ease-in",
          style({ transform: "translateX(100%)", opacity: 0 }),
        ),
      ]),
    ]),
  ],
})
export class ToastComponent implements OnInit, OnDestroy {
  toasts: Toast[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private toastService: ToastService) {}

  ngOnInit(): void {
    this.subscription = this.toastService.toasts$.subscribe((toasts) => {
      this.toasts = toasts;
    });
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  trackByToastId(index: number, toast: Toast): string {
    return toast.id;
  }

  getToastClass(type: Toast["type"]): string {
    return type;
  }

  removeToast(id: string): void {
    this.toastService.removeToast(id);
  }
}
