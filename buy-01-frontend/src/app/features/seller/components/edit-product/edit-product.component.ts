import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { SellerService, ProductResponse } from "../../services/seller.service";
import { ToastService } from "../../../../shared/services/toast.service";

@Component({
  selector: "app-edit-product",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-product.component.html",
  styleUrls: ["./edit-product.component.css"],
})
export class EditProductComponent implements OnInit {
  editForm: FormGroup;
  productId: string = "";
  product: ProductResponse | null = null;
  isLoading = false;
  isSubmitting = false;
  selectedFiles: File[] = [];
  existingImages: { id: string; imageUrl: string; productId: string }[] = [];
  imagePreviewUrls: string[] = [];
  errorMessage = "";
  successMessage = "";

  // File upload restrictions
  readonly MAX_FILES = 5;
  readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  readonly ALLOWED_TYPES = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
  ];

  constructor(
    private fb: FormBuilder,
    private sellerService: SellerService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService,
  ) {
    this.editForm = this.fb.group({
      name: ["", [Validators.required, Validators.minLength(3)]],
      description: ["", [Validators.required, Validators.minLength(10)]],
      price: ["", [Validators.required, Validators.min(0.01)]],
      quantity: ["", [Validators.required, Validators.min(1)]],
    });
  }

  ngOnInit(): void {
    this.productId = this.route.snapshot.paramMap.get("id") || "";
    if (this.productId) {
      this.loadProduct();
    } else {
      this.router.navigate(["/seller/my-products"]);
    }
  }

  private loadProduct(): void {
    this.isLoading = true;
    this.sellerService.getMyProducts().subscribe({
      next: (products) => {
        this.product = products.find((p) => p.id === this.productId) || null;
        if (this.product) {
          // Validate user ownership
          const token = this.sellerService.getToken();
          if (token) {
            const currentUserId = this.sellerService.getUserId(token);
            if (currentUserId && this.product.userId !== currentUserId) {
              this.errorMessage =
                "Access denied: You can only edit your own products";
              setTimeout(
                () => this.router.navigate(["/seller/my-products"]),
                3000,
              );
              this.isLoading = false;
              return;
            }
          }

          this.populateForm();
          this.existingImages = [...this.product.images];
        } else {
          this.errorMessage = "Product not found or access denied";
          setTimeout(() => this.router.navigate(["/seller/my-products"]), 3000);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error("Error loading product:", error);
        this.errorMessage = "Failed to load product details";
        this.isLoading = false;
        setTimeout(() => this.router.navigate(["/seller/my-products"]), 3000);
      },
    });
  }

  private populateForm(): void {
    if (this.product) {
      this.editForm.patchValue({
        name: this.product.name,
        description: this.product.description,
        price: this.product.price,
        quantity: this.product.quantity,
      });
    }
  }

  onFileSelect(event: any): void {
    const files = Array.from(event.target.files) as File[];

    // Check total image limit
    const maxNewImages = this.MAX_FILES - this.existingImages.length;
    if (files.length > maxNewImages) {
      this.toastService.error(
        "Too Many Files",
        `You can only add ${maxNewImages} more image(s). You already have ${this.existingImages.length} existing image(s).`,
      );
      event.target.value = "";
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
      this.selectedFiles = validFiles;
      this.imagePreviewUrls = [];

      validFiles.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreviewUrls.push(e.target.result);
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

      this.errorMessage = "";
    }

    // Reset the input
    event.target.value = "";
  }

  removeNewImage(index: number): void {
    const removedFile = this.selectedFiles[index];
    this.selectedFiles.splice(index, 1);
    this.imagePreviewUrls.splice(index, 1);

    this.toastService.info(
      "File Removed",
      `"${removedFile.name}" has been removed.`,
    );
  }

  removeExistingImage(index: number): void {
    const removedImage = this.existingImages[index];
    this.existingImages.splice(index, 1);

    this.toastService.info("Image Removed", "Existing image has been removed.");
  }

  onSubmit(): void {
    if (this.editForm.valid) {
      // Validate that product has at least one image
      const totalImages =
        this.existingImages.length + this.selectedFiles.length;
      if (totalImages === 0) {
        this.errorMessage =
          "Product must have at least one image. Please add an image or keep existing ones.";
        return;
      }

      this.isSubmitting = true;
      this.errorMessage = "";
      this.successMessage = "";

      const formData = this.editForm.value;

      // Prepare update data using the correct interface
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      };

      // Add new images if any
      if (this.selectedFiles.length > 0) {
        updateData.images = this.selectedFiles;
      }

      // Additional security check before updating
      const token = this.sellerService.getToken();
      if (token && this.product) {
        const currentUserId = this.sellerService.getUserId(token);
        if (currentUserId && this.product.userId !== currentUserId) {
          this.errorMessage =
            "Access denied: You can only update your own products";
          this.isSubmitting = false;
          return;
        }
      }

      this.sellerService.updateProduct(this.productId, updateData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          this.toastService.productUpdated(updateData.name);

          // Clear selected files since they've been uploaded
          this.selectedFiles = [];
          this.imagePreviewUrls = [];

          // Refresh product data to show updated images
          this.refreshProductData();

          // Small delay to show the success toast before navigation
          setTimeout(() => {
            this.router.navigate(["/seller/my-products"]);
          }, 1000);
        },
        error: (error) => {
          console.error("Error updating product:", error);
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
              "Failed to update product. Please try again.";
            this.toastService.error("Update Failed", message);
          }
        },
      });
    } else {
      this.markFormGroupTouched();
      this.toastService.error(
        "Form Invalid",
        "Please fill in all required fields correctly.",
      );
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.editForm.controls).forEach((key) => {
      const control = this.editForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.editForm.get(fieldName);
    if (field && field.errors) {
      if (field.errors["required"]) {
        return `${this.getFieldDisplayName(fieldName)} is required`;
      }
      if (field.errors["minlength"]) {
        return `${this.getFieldDisplayName(fieldName)} must be at least ${field.errors["minlength"].requiredLength} characters`;
      }
      if (field.errors["min"]) {
        return `${this.getFieldDisplayName(fieldName)} must be greater than ${field.errors["min"].min}`;
      }
    }
    return "";
  }

  private getFieldDisplayName(fieldName: string): string {
    const displayNames: { [key: string]: string } = {
      name: "Product name",
      description: "Description",
      price: "Price",
      quantity: "Quantity",
    };
    return displayNames[fieldName] || fieldName;
  }

  onCancel(): void {
    this.router.navigate(["/seller/my-products"]);
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat("fr-SN", {
      style: "currency",
      currency: "XOF",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  getTotalImages(): number {
    return this.existingImages.length + this.selectedFiles.length;
  }

  hasMinimumImages(): boolean {
    return this.getTotalImages() > 0;
  }

  getImageValidationMessage(): string {
    if (this.getTotalImages() === 0) {
      return "At least one image is required";
    }
    return "";
  }

  private refreshProductData(): void {
    // Refresh the product data from the server to get updated images
    this.sellerService.getMyProducts().subscribe({
      next: (products) => {
        const updatedProduct = products.find((p) => p.id === this.productId);
        if (updatedProduct) {
          this.product = updatedProduct;
          this.existingImages = [...updatedProduct.images];
        }
      },
      error: (error) => {
        console.error("Error refreshing product data:", error);
      },
    });
  }

  private formatFileSize(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  get canAddMoreImages(): boolean {
    return (
      this.existingImages.length + this.selectedFiles.length < this.MAX_FILES
    );
  }

  get remainingImageSlots(): number {
    return (
      this.MAX_FILES - (this.existingImages.length + this.selectedFiles.length)
    );
  }
}
