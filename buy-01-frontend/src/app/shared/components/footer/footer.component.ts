import { Component, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { LucideAngularModule, ShoppingCart } from "lucide-angular";
import { AuthService } from "../../../auth/services/auth.service";

@Component({
  selector: "app-footer",
  standalone: true,
  imports: [CommonModule, RouterModule, LucideAngularModule, FormsModule],
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  readonly ShoppingCart = ShoppingCart;
  newsletterEmail = "";

  private authService = inject(AuthService);

  get isSeller(): boolean {
    // This would typically check user role from auth service
    // For now, return false as placeholder
    return false;
  }

  onNewsletterSubmit(): void {
    if (this.newsletterEmail) {
      console.log("Newsletter subscription:", this.newsletterEmail);
      // Here you would typically call a newsletter service
      // For now, just log and reset
      this.newsletterEmail = "";
      // Show success message to user
    }
  }
}
