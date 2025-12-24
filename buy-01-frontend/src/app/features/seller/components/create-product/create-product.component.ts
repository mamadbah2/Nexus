import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router } from "@angular/router";
import {
  SellerService,
  CreateProductRequest,
} from "../../services/seller.service";
import { ToastService } from "../../../../shared/services/toast.service";
import { LucideAngularModule, Upload, X, Plus, Save } from "lucide-angular";

@Component({
  selector: "app-create-product",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LucideAngularModule],
  templateUrl: "./create-product.component.html",
  styleUrls: ["./create-product.component.css"],
})
export class CreateProductComponent implements OnInit {
  productForm!: FormGroup;
  selectedImages: File[] = [];
  imagePreviewUrls: string[] = [];
  isSubmitting = false;
  submitError: string | null = null;

  // File upload restrictions
  readonly MAX_FILES = 5;
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  // Lucide icons
  readonly Upload = Upload;
  readonly X = X;
  readonly Plus = Plus;
  readonly Save = Save;

  constructor(
    private fb: FormBuilder,
    private sellerService: SellerService,
    private router: Router,
    private toastService: ToastService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  private initializeForm(): void {
    this.productForm = this.fb.group({
      name: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(100),
        ],
      ],
      description: [
        "",
        [
          Validators.required,
          Validators.minLength(10),
          Validators.maxLength(1000),
        ],
      ],
      price: [
        "",
        [Validators.required, Validators.min(1), Validators.max(10000000)],
      ],
      quantity: [
        "",
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
    });
  }

  onImageSelect(event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const files = Array.from(target.files);

      // Check if adding these files would exceed the limit
      if (this.selectedImages.length + files.length > this.MAX_FILES) {
        this.toastService.fileCountError(this.MAX_FILES);
        target.value = "";
        return;
      }

      const validFiles: File[] = [];
      const rejectedFiles: string[] = [];

      files.forEach((file) => {
        // Check file type
        if (!this.ALLOWED_TYPES.includes(file.type)) {
          this.toastService.fileTypeError(file.name, this.ALLOWED_TYPES);
          rejectedFiles.push(file.name);
          return;
        }

        // Check file size
        if (file.size > this.MAX_FILE_SIZE) {
          this.toastService.fileSizeError(
            file.name,
            this.formatFileSize(this.MAX_FILE_SIZE),
          );
          rejectedFiles.push(file.name);
          return;
        }

        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        // Add valid files to existing ones
        this.selectedImages = [...this.selectedImages, ...validFiles];

        // Create preview URLs for new images
        validFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              this.imagePreviewUrls.push(e.target.result as string);
            }
          };
          reader.readAsDataURL(file);
        });

        // Show success message
        if (validFiles.length === 1) {
          this.toastService.success(
            "File Added",
            `"${validFiles[0].name}" has been added successfully.`,
          );
        } else {
          this.toastService.success(
            "Files Added",
            `${validFiles.length} files have been added successfully.`,
          );
        }
      }

      // Reset the input
      target.value = "";
    }
  }

  removeImage(index: number): void {
    const removedFile = this.selectedImages[index];
    this.selectedImages.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);

    this.toastService.info(
      "File Removed",
      `"${removedFile.name}" has been removed.`,
    );
  }

  onSubmit(): void {
    if (this.productForm.valid && this.selectedImages.length > 0) {
      this.isSubmitting = true;
      this.submitError = null;

      const formValue = this.productForm.value;
      const productData: CreateProductRequest = {
        name: formValue.name.trim(),
        description: formValue.description.trim(),
        price: parseFloat(formValue.price),
        quantity: parseInt(formValue.quantity),
        images: this.selectedImages,
      };

      console.log("Submitting product data:", productData);
      console.log("JWT Token present:", !!this.sellerService.getToken());

      this.sellerService.createProduct(productData).subscribe({
        next: (response) => {
          console.log("Product created successfully:", response);
          this.toastService.productCreated(formValue.name.trim());

          // Small delay to show the success toast before navigation
          setTimeout(() => {
            this.router.navigate(["/seller/my-products"]);
          }, 1000);
        },
        error: (error) => {
          console.error("Error creating product:", error);
          console.error("Error status:", error.status);
          console.error("Error details:", error.error);

          this.isSubmitting = false;

          if (error.status === 401) {
            this.toastService.authError();
          } else if (error.status === 400) {
            const message =
              error.error?.message ||
              "Invalid product data. Please check your inputs.";
            this.toastService.error("Validation Error", message);
          } else if (error.status === 413) {
            this.toastService.error(
              "Files Too Large",
              "The uploaded files are too large. Please use smaller images.",
            );
          } else if (error.status === 0) {
            this.toastService.networkError();
          } else if (error.status >= 500) {
            this.toastService.serverError();
          } else {
            const message =
              error.error?.message ||
              "An error occurred while creating the product. Please try again.";
            this.toastService.error("Creation Failed", message);
          }
        },
      });
    } else {
      this.markFormGroupTouched();
      if (this.selectedImages.length === 0) {
        this.toastService.error(
          "Missing Images",
          "Please select at least one image for your product.",
        );
      } else {
        this.toastService.error(
          "Form Invalid",
          "Please fill in all required fields correctly.",
        );
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.productForm.controls).forEach((key) => {
      const control = this.productForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.productForm.get(fieldName);
    return field ? field.invalid && field.touched : false;
  }

  getFieldError(fieldName: string): string {
    const field = this.productForm.get(fieldName);
    if (field && field.errors && field.touched) {
      if (field.errors["required"])
        return `${this.getFieldLabel(fieldName)} is required.`;
      if (field.errors["minlength"])
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters.`;
      if (field.errors["maxlength"])
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors["maxlength"].requiredLength} characters.`;
      if (field.errors["min"])
        return `${this.getFieldLabel(fieldName)} must be at least ${field.errors["min"].min}.`;
      if (field.errors["max"])
        return `${this.getFieldLabel(fieldName)} must not exceed ${field.errors["max"].max}.`;
    }
    return "";
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      name: "Product name",
      description: "Description",
      price: "Price",
      quantity: "Quantity",
    };
    return labels[fieldName] || fieldName;
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  goBack(): void {
    this.router.navigate(["/seller/my-products"]);
  }

  get canAddMoreImages(): boolean {
    return this.selectedImages.length < this.MAX_FILES;
  }

  get remainingImageSlots(): number {
    return this.MAX_FILES - this.selectedImages.length;
  }
}
