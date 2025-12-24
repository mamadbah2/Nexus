import { Component, Input, Output, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";

export interface ConfirmationModalData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info";
}

@Component({
  selector: "app-confirmation-modal",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="isVisible" (click)="onBackdropClick()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <div class="modal-icon" [ngClass]="getIconClass()">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                *ngIf="data.type === 'danger'"
                d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
              ></path>
              <line
                *ngIf="data.type === 'danger'"
                x1="12"
                y1="9"
                x2="12"
                y2="13"
              ></line>
              <line
                *ngIf="data.type === 'danger'"
                x1="12"
                y1="17"
                x2="12.01"
                y2="17"
              ></line>

              <circle
                *ngIf="data.type === 'warning'"
                cx="12"
                cy="12"
                r="10"
              ></circle>
              <line
                *ngIf="data.type === 'warning'"
                x1="12"
                y1="8"
                x2="12"
                y2="12"
              ></line>
              <line
                *ngIf="data.type === 'warning'"
                x1="12"
                y1="16"
                x2="12.01"
                y2="16"
              ></line>

              <circle
                *ngIf="data.type === 'info'"
                cx="12"
                cy="12"
                r="10"
              ></circle>
              <line
                *ngIf="data.type === 'info'"
                x1="12"
                y1="16"
                x2="12"
                y2="12"
              ></line>
              <line
                *ngIf="data.type === 'info'"
                x1="12"
                y1="8"
                x2="12.01"
                y2="8"
              ></line>
            </svg>
          </div>
          <h3 class="modal-title">{{ data.title }}</h3>
        </div>

        <div class="modal-body">
          <p class="modal-message">{{ data.message }}</p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            (click)="onCancel()"
            [disabled]="isProcessing"
          >
            {{ data.cancelText || "Cancel" }}
          </button>
          <button
            type="button"
            class="btn"
            [ngClass]="getConfirmButtonClass()"
            (click)="onConfirm()"
            [disabled]="isProcessing"
          >
            <svg
              *ngIf="isProcessing"
              class="animate-spin"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10"></circle>
            </svg>
            <span>{{ data.confirmText || "Confirm" }}</span>
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .modal-backdrop {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 99999 !important;
        padding: var(--space-4);
        animation: fadeIn 0.2s ease-out;
      }

      .modal-content {
        background: var(--background-primary);
        border-radius: var(--radius-2xl);
        box-shadow: var(--shadow-2xl);
        border: 1px solid var(--border-primary);
        position: relative;
        z-index: 100000 !important;
        max-width: 400px;
        width: 100%;
        animation: slideInUp 0.3s ease-out;
      }

      .modal-header {
        padding: var(--space-6) var(--space-6) var(--space-4);
        text-align: center;
      }

      .modal-icon {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        display: flex;
        align-items: center;
        justify-content: center;
        margin: 0 auto var(--space-4);
      }

      .modal-icon.danger {
        background: #fee2e2;
        color: var(--accent-red);
      }

      .modal-icon.warning {
        background: #fef3c7;
        color: var(--accent-yellow);
      }

      .modal-icon.info {
        background: var(--primary-100);
        color: var(--primary-600);
      }

      .modal-title {
        font-size: var(--text-lg);
        font-weight: var(--font-semibold);
        color: var(--text-primary);
        margin: 0;
        font-family: "Poppins", sans-serif;
      }

      .modal-body {
        padding: 0 var(--space-6) var(--space-6);
        text-align: center;
      }

      .modal-message {
        color: var(--text-secondary);
        font-size: var(--text-base);
        line-height: 1.6;
        margin: 0;
      }

      .modal-footer {
        padding: var(--space-4) var(--space-6) var(--space-6);
        display: flex;
        gap: var(--space-3);
        justify-content: center;
      }

      .btn {
        min-width: 100px;
        justify-content: center;
      }

      .btn-danger {
        background: var(--accent-red);
        color: white;
        box-shadow: var(--shadow-md);
      }

      .btn-danger:hover:not(:disabled) {
        background: #dc2626;
        transform: translateY(-1px);
        box-shadow: var(--shadow-lg);
      }

      .btn-warning {
        background: var(--accent-yellow);
        color: white;
        box-shadow: var(--shadow-md);
      }

      .btn-warning:hover:not(:disabled) {
        background: #d97706;
        transform: translateY(-1px);
        box-shadow: var(--shadow-lg);
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      @keyframes slideInUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      @media (max-width: 480px) {
        .modal-content {
          margin: var(--space-4);
        }

        .modal-footer {
          flex-direction: column;
        }

        .btn {
          width: 100%;
        }
      }
    `,
  ],
})
export class ConfirmationModalComponent {
  @Input() isVisible = false;
  @Input() data: ConfirmationModalData = {
    title: "",
    message: "",
    type: "info",
  };
  @Input() isProcessing = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  getIconClass(): string {
    return this.data.type || "info";
  }

  getConfirmButtonClass(): string {
    switch (this.data.type) {
      case "danger":
        return "btn-danger";
      case "warning":
        return "btn-warning";
      default:
        return "btn-primary";
    }
  }

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onBackdropClick(): void {
    if (!this.isProcessing) {
      this.onCancel();
    }
  }
}
