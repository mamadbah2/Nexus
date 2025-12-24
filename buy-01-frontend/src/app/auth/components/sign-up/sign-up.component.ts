import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {AuthService} from '../../services/auth.service';
import {startWith} from 'rxjs';

@Component({
  selector: 'app-sign-up',
  imports: [
    ReactiveFormsModule
  ],
  templateUrl: './sign-up.component.html',
  styleUrls: ['./sign-up.component.css', '../sign/sign.component.css'],
})
export class SignUpComponent {
  @Output() isSignUp = new EventEmitter<boolean>();
  selectedFileName : string = "Aucun fichier choisi"
  selectedFile:any
  isSeller = false
  ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'gif'];
  errorOccured : string | null = null;

  registerForm = new FormGroup({
    firstName: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    isSeller: new FormControl('')
  });

  constructor(private authService: AuthService) {
  }

  ngOnInit() {
    this.registerForm.get('isSeller')?.valueChanges.pipe(
      startWith(this.registerForm.get('isSeller')?.value)
    ).subscribe((value) => {
      console.log(value)
      this.isSeller = !!value
      if (!this.isSeller) {
        this.selectedFile= null
        this.selectedFileName= "Aucun fichier selectionne"
      }
      }
    )
  }

  handleFileSelection($event: Event) {
    const inputFile = $event.target as HTMLInputElement
    if (inputFile.files && inputFile.files.length > 0) {
      this.selectedFileName = inputFile.files[0].name
      const fileExtension = this.selectedFileName.split('.').pop()?.toLowerCase();
      if (fileExtension && this.ALLOWED_EXTENSIONS.includes(fileExtension)) {
        this.selectedFile = inputFile.files[0]
      }
    } else {
      this.selectedFileName = "Aucun fichier choisi"
      this.selectedFile = null
    }
  }

  handleSubmit() {
    if (this.registerForm.valid) {
      this.authService.register(this.registerForm.value, this.selectedFile).subscribe({
        next : value => {
          console.log(value)
          console.log("User cree avec succes")
          this.isSignUp.emit(true)
        },
        error: err => {
          console.log(err)
          this.errorOccured = err.status+ " - " + err.statusText;
          setTimeout(()=> this.errorOccured = null, 5000)
          console.log("Erreur lors de la creation du user")
        }
      })
    }
  }
}
