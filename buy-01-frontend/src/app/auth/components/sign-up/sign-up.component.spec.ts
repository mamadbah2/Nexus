import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { SignUpComponent } from './sign-up.component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute} from '@angular/router';
import {of, throwError} from 'rxjs';
import {AuthService} from '../../services/auth.service';

describe('SignUpComponent', () => {
  let component: SignUpComponent;
  let fixture: ComponentFixture<SignUpComponent>;
  // On definit des objets "spy" pour nos services
  let mockAuthService: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'setToken', 'getCurrentUser', 'register']);
    await TestBed.configureTestingModule({
      imports: [SignUpComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '123' }), // mock paramètre id=123
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        }
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ======================================================
// 1. Tests sur l'initialisation et la validation du formulaire
// ======================================================
  describe('Form Initialization and Validation', () => {
    it('should initialize an empty and invalid form', () => {
      expect(component.registerForm.valid).toBeFalsy();
    });

    it('should require firstName, lastName, email, and password', () => {
      const form = component.registerForm;
      expect(form.get('firstName')!.hasError('required')).toBeTruthy();
      expect(form.get('lastName')!.hasError('required')).toBeTruthy();
      expect(form.get('email')!.hasError('required')).toBeTruthy();
      expect(form.get('password')!.hasError('required')).toBeTruthy();
    });

    it('should make the form valid when all required fields are filled', () => {
      const form = component.registerForm;
      form.get('firstName')!.setValue('John');
      form.get('lastName')!.setValue('Doe');
      form.get('email')!.setValue('john.doe@example.com');
      form.get('password')!.setValue('password123');
      expect(form.valid).toBeTruthy();
    });
  });

// ======================================================
// 2. Tests sur la logique de la checkbox "isSeller" (depuis ngOnInit)
// ======================================================
  describe('isSeller Checkbox Logic', () => {
    it('should set isSeller to true when the checkbox is checked', () => {
      component.registerForm.get('isSeller')!.setValue('true');
      fixture.detectChanges();
      console.log(component.isSeller)
      console.log('**********************************************')
      expect(component.isSeller).toBeTrue()
    });
  });

// ======================================================
// 3. Tests sur la gestion des fichiers (handleFileSelection)
// ======================================================
   describe('File Handling', () => {
      // Fonction utilitaire pour créer un mock d'événement de fichier
      function createMockFileEvent(file: File): Event {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        return {
          target: {
            files: dataTransfer.files,
          },
        } as unknown as Event;
      }

      it('should handle selection of a valid file', () => {
        const testFile = new File(['content'], 'test-image.png', { type: 'image/png' });
        const mockEvent = createMockFileEvent(testFile);

        component.handleFileSelection(mockEvent);

        expect(component.selectedFileName).toBe('test-image.png');
        expect(component.selectedFile).toEqual(testFile);
      });

      it('should reset when the file dialog is cancelled', () => {
        const mockEvent = { target: { files: [] } } as unknown as Event;
        component.handleFileSelection(mockEvent);
        expect(component.selectedFileName).toBe('Aucun fichier choisi');
        expect(component.selectedFile).toBeNull();
      });
    });


  // ======================================================
  // 4. Tests sur la soumission du formulaire (handleSubmit)
  // ======================================================
    describe('Form Submission (handleSubmit)', () => {

     it('should NOT call authService.register if the form is invalid', () => {
       component.handleSubmit();
       expect(mockAuthService.register).not.toHaveBeenCalled();
     });
   });
});


