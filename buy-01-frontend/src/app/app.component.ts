import { Component } from "@angular/core";
import { SignComponent } from "./auth/components/sign/sign.component";
import { RouterOutlet } from "@angular/router";
import { NavbarComponent } from "./shared/components/navbar/navbar.component";
import { FooterComponent } from "./shared/components/footer/footer.component";
import { ToastComponent } from "./shared/components/toast/toast.component";

@Component({
  selector: "app-root",
  imports: [RouterOutlet, NavbarComponent, FooterComponent, ToastComponent],
  templateUrl: "./app.component.html",
  styleUrl: "./app.component.css",
})
export class AppComponent {
  title = "buy-01-frontend";
}
