import {ComponentFixture, fakeAsync, TestBed, tick} from '@angular/core/testing';

import { SignInComponent } from './sign-in.component';
import {provideHttpClient} from '@angular/common/http';
import {provideHttpClientTesting} from '@angular/common/http/testing';
import {ActivatedRoute, Router} from '@angular/router';
import {of, throwError} from 'rxjs';
import {AuthService} from '../../services/auth.service';
import {LoginResponse} from '../../models/login.response';
import {User} from '../../models/user';

describe('SignInComponent', () => {
  let component: SignInComponent;
  let fixture: ComponentFixture<SignInComponent>;
  // On definit des objets "spy" pour nos services
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let localStorageSpy: jasmine.SpyObj<Storage>;

  beforeEach(async () => {
    // Création des mocks avec les méthodes que le composant utilise
    mockAuthService = jasmine.createSpyObj('AuthService', ['login', 'setToken', 'getCurrentUser']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);

    // On peut aussi espionner les objets globaux comme localStorage
    localStorageSpy = spyOnAllFunctions(localStorage);
    spyOn(window, 'dispatchEvent');

    await TestBed.configureTestingModule({
      imports: [SignInComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({ get: (key: string) => '123' }), // mock paramètre id=123
            snapshot: { paramMap: { get: (key: string) => '123' } }
          }
        },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(SignInComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
  // ======================================================
  // 1. Tests sur le formulaire (loginForm)
  // ======================================================

  describe('Form Validation', () => {
    it('should initialize an empty and invalid form', () => {
      expect(component.loginForm.valid)!.toBeFalsy();
      expect(component.loginForm.get('email')!.value).toBe('');
      expect(component.loginForm.get('password')!.value).toBe('');
    });

    it('should invalidate the form when email is empty or malformed', () => {
      const emailControl = component.loginForm.get('email');

      if (emailControl) {
        emailControl.setValue('');
        expect(emailControl.hasError('required')).toBeTruthy();

        emailControl.setValue('not-an-email');
        expect(emailControl.hasError('email')).toBeTruthy();
      }
    });

    it('should invalidate the form when password is too short', () => {
      const passwordControl = component.loginForm.get('password');
      if (passwordControl) {
        passwordControl.setValue('ab'); // Moins de 3 caractères
        expect(passwordControl.hasError('minlength')).toBeTruthy();
      }
    });

    it('should validate the form when email and password are correct', () => {
        component.loginForm.get('email')!.setValue('test@example.com');
        component.loginForm.get('password')!.setValue('password123');

      expect(component.loginForm.valid).toBeTruthy();
    });
  });

  // ======================================================
  // 2. Tests sur la soumission (onSubmit)
  // ======================================================

  describe('Form Submission (onSubmit)', () => {

    it('should NOT call authService.login if the form is invalid', () => {
      // Le formulaire est invalide par défaut
      component.onSubmit();
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should handle successful login, user fetch, and navigation (happy path)', () => {
      // Arrange: Préparer le scénario de succès
      const mockLoginResponse: LoginResponse = {token: 'fake-jwt-token', email: 'test@gmail.com', role: ['role_user']};
      const mockUserResponse: User = { email: 'test@example.com', role: 'role_user', name: 'Test User', avatar: 'me/avatar', password: ''};


      mockAuthService.login.and.returnValue(of(mockLoginResponse));
      mockAuthService.getCurrentUser.and.returnValue(of(mockUserResponse));
      mockRouter.navigate.and.returnValue(Promise.resolve(true));

      // Act: Remplir le formulaire et soumettre
      component.loginForm.get('email')!.setValue('test@example.com');
      component.loginForm.get('password')!.setValue('password123');


      component.onSubmit();

      // Assert: Vérifier que tout a été appelé correctement
      expect(mockAuthService.login).toHaveBeenCalledOnceWith({email: 'test@example.com', password: 'password123'});
      expect(mockAuthService.setToken).toHaveBeenCalledOnceWith(mockLoginResponse.token);
      expect(mockAuthService.getCurrentUser).toHaveBeenCalledOnceWith();
      /*expect(localStorage.setItem).toHaveBeenCalledOnceWith('currentUser', JSON.stringify(mockUserResponse));*/
      expect(window.dispatchEvent).toHaveBeenCalled();
      expect(mockRouter.navigate).toHaveBeenCalledOnceWith(['/']);
    });

    it('should display an error message for 401 Unauthorized error', () => {
      // Arrange: Simuler une erreur 401
      mockAuthService.login.and.returnValue(throwError(() => ({status: 401})));

      // Act
      component.loginForm.get('email')!.setValue('test@example.com');
      component.loginForm.get('password')!.setValue('wrongpassword');
      component.onSubmit();

      // Assert
      expect(component.error_message).toBe('Invalid email or password');
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it('should clear the error message after 2 seconds', fakeAsync(() => {
      // Arrange
      mockAuthService.login.and.returnValue(throwError(() => ({status: 401})));

      // Act
      component.loginForm.get('email')!.setValue('test@example.com');
      component.loginForm.get('password')!.setValue('wrongpassword');
      component.onSubmit();

      // Assert 1: Le message est bien affiché
      expect(component.error_message).toBe('Invalid email or password');

      // Act 2: On avance le temps de 2 secondes
      tick(2000);
      fixture.detectChanges(); // Mettre à jour la vue avec le nouvel état

      // Assert 2: Le message a disparu
      expect(component.error_message).toBeNull();
    }));

    it('should handle generic server errors (e.g., 500)', () => {
      // Arrange
      mockAuthService.login.and.returnValue(throwError(() => ({status: 500})));

      // Act
      component.loginForm.get('email')!.setValue('test@example.com');
      component.loginForm.get('password')!.setValue('password123');
      component.onSubmit();

      // Assert
      expect(component.error_message).toBe('An unexpected error occurred. Please try again.');
    });

    it('should handle error when fetching user details after a successful login', () => {
      // Arrange
      mockAuthService.login.and.returnValue(of({token: 'fake-jwt-token'}));
      mockAuthService.getCurrentUser.and.returnValue(throwError(() => 'Failed to fetch user'));

      // Act
      component.loginForm.get('email')!.setValue('test@example.com');
      component.loginForm.get('password')!.setValue('password123');
      component.onSubmit();

      // Assert
      expect(mockAuthService.setToken).toHaveBeenCalledOnceWith('fake-jwt-token'); // Le token est quand même enregistré
      expect(localStorage.setItem).not.toHaveBeenCalled(); // Mais pas les infos user
      expect(mockRouter.navigate).not.toHaveBeenCalled(); // Et pas de redirection
    });
  });
});
