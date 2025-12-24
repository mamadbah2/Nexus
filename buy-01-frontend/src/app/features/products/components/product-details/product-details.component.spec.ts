/*
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { ReplaySubject, of, throwError } from 'rxjs';

import { ProductDetailsComponent } from './product-details.component';
import { ProductService } from '../../services/product.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { ProductModels } from '../../models/product.models';

// Mocks de données pour les tests
const MOCK_PRODUCT: ProductModels = {
  id: 'prod-123',
  name: 'Super Fauteuil',
  price: '75000',
  quantity: '15',
  description: 'Un fauteuil très confortable.',
  userId: 'user-abc-123', // <-- AJOUTÉ
  images: [
    {
      id: 'img-1',
      imageUrl: 'image1.jpg',
      productId: 'prod-123' // <-- AJOUTÉ (doit correspondre à l'id du produit)
    },
    {
      id: 'img-2',
      imageUrl: 'image2.jpg',
      productId: 'prod-123' // <-- AJOUTÉ (doit correspondre à l'id du produit)
    }
  ]
};

export const MOCK_PRODUCT_LIST: ProductModels[] = [
  {
    id: 'prod-123',
    name: 'Super Fauteuil',
    price: '75000',
    quantity: '15',
    description: 'Desc 1',
    userId: 'user-abc-123', // <-- AJOUTÉ
    images: [ // <-- AJOUTÉ
      { id: 'img-1', imageUrl: 'fauteuil-1.jpg', productId: 'prod-123' },
      { id: 'img-2', imageUrl: 'fauteuil-2.jpg', productId: 'prod-123' }
    ]
  },
  {
    id: 'prod-456',
    name: 'Lampe Design',
    price: '25000',
    quantity: '30',
    description: 'Desc 2',
    userId: 'user-def-456', // <-- AJOUTÉ
    images: [ // <-- AJOUTÉ
      { id: 'img-3', imageUrl: 'lampe-1.jpg', productId: 'prod-456' }
    ]
  },
  {
    id: 'prod-789',
    name: 'Table Basse',
    price: '50000',
    quantity: '10',
    description: 'Desc 3',
    userId: 'user-abc-123', // <-- AJOUTÉ
    images: [ // <-- AJOUTÉ
      { id: 'img-4', imageUrl: 'table-1.jpg', productId: 'prod-789' },
      { id: 'img-5', imageUrl: 'table-2.jpg', productId: 'prod-789' }
    ]
  }
];


describe('ProductDetailsComponent', () => {
  let component: ProductDetailsComponent;
  let fixture: ComponentFixture<ProductDetailsComponent>;

  // Mocks pour les services
  let mockProductService: jasmine.SpyObj<ProductService>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockLocation: jasmine.SpyObj<Location>;

  // Sujet pour contrôler le paramètre de la route
  let routeParamMapSubject: ReplaySubject<any>;

  beforeEach(async () => {
    // Initialisation du sujet pour simuler les changements de l'URL
    routeParamMapSubject = new ReplaySubject(1);

    // Création des mocks des services avec les méthodes utilisées par le composant
    mockProductService = jasmine.createSpyObj('ProductService', ['getOneProduct', 'getProductList']);
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn']);
    mockLocation = jasmine.createSpyObj('Location', ['back']);

    await TestBed.configureTestingModule({
      imports: [ProductDetailsComponent], // Le composant est standalone
      providers: [
        { provide: ProductService, useValue: mockProductService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Location, useValue: mockLocation },
        {
          provide: ActivatedRoute,
          useValue: {
            // Simule l'observable paramMap
            paramMap: routeParamMapSubject.asObservable(),
            // Simule le snapshot pour l'accès synchrone initial
            snapshot: {
              paramMap: {
                get: (key: string) => 'prod-123' // ID par défaut pour l'initialisation
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProductDetailsComponent);
    component = fixture.componentInstance;

    // Espionnage des fonctions globales du navigateur
    spyOn(console, 'error'); // Pour ne pas polluer la console de test
    spyOn(window, 'alert').and.stub();
    spyOn(window, 'confirm').and.stub();
    // Espionner `window.location.href` nécessite un setter
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true
    });
  });

  // ======================================================
  // TESTS DE CHARGEMENT DES DONNÉES
  // ======================================================
  describe('Data Loading', () => {
    it('should load product and related products on init (happy path)', fakeAsync(() => {
      // Arrange
      mockProductService.getOneProduct.and.returnValue(of(MOCK_PRODUCT));
      mockProductService.getProductList.and.returnValue(of(MOCK_PRODUCT_LIST));

      // Act: déclenche ngOnInit
      routeParamMapSubject.next({ get: (key: string) => 'prod-123' });
      fixture.detectChanges();
      tick(); // Attendre la résolution des observables

      // Assert
      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeFalse();
      /!*expect(component.product).toEqual(MOCK_PRODUCT);*!/
      /!*expect(component.selectedImage).toBe('image1.jpg');*!/
      expect(component.relatedProducts.length).toBe(2); // La liste mockée moins le produit actuel
      expect(mockProductService.getOneProduct).toHaveBeenCalledWith('prod-123');
      expect(mockProductService.getProductList).toHaveBeenCalled();
    }));

    it('should handle product not found (404 error)', fakeAsync(() => {
      // Arrange
      const error404 = { status: 404, name: 'HttpErrorResponse' };
      mockProductService.getOneProduct.and.returnValue(throwError(() => error404));

      // Act
      routeParamMapSubject.next({ get: (key: string) => 'prod-999' });
      fixture.detectChanges();
      tick();

      // Assert
      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeTrue();
      expect(component.product).toBeNull();
      expect(component.errorType).toBe('not-found');
      expect(component.errorMessage).toContain("Product not found");
    }));

    it('should handle server error (500 error)', fakeAsync(() => {
      const error500 = { status: 500, name: 'HttpErrorResponse' };
      mockProductService.getOneProduct.and.returnValue(throwError(() => error500));
      routeParamMapSubject.next({ get: (key: string) => 'prod-123' });
      fixture.detectChanges();
      tick();

      expect(component.hasError).toBeTrue();
      expect(component.errorType).toBe('server-error');
      expect(component.errorMessage).toContain("Server error occurred");
    }));

    it('should handle case where no ID is provided in route', fakeAsync(() => {
      // Arrange: Simule un snapshot sans 'id'
      (TestBed.inject(ActivatedRoute).snapshot.paramMap.get as jasmine.Spy).and.returnValue(null);

      // Act
      routeParamMapSubject.next({ get: (key: string) => null });
      fixture.detectChanges();
      tick();

      // Assert
      expect(component.isLoading).toBeFalse();
      expect(component.hasError).toBeTrue();
      expect(component.errorType).toBe('not-found');
      expect(component.errorMessage).toBe('No product ID provided.');
    }));
  });

  // ======================================================
  // TESTS DES INTERACTIONS UTILISATEUR
  // ======================================================
  describe('User Interactions', () => {
    beforeEach(fakeAsync(() => {
      // Pré-charger les données pour les tests d'interaction
      mockProductService.getOneProduct.and.returnValue(of(MOCK_PRODUCT));
      mockProductService.getProductList.and.returnValue(of(MOCK_PRODUCT_LIST));
      routeParamMapSubject.next({ get: (key: string) => 'prod-123' });
      fixture.detectChanges();
      tick();
    }));

    it('should change selected image when selectImage is called', () => {
      component.selectImage('image2.jpg');
      expect(component.selectedImage).toBe('image2.jpg');
    });

    it('should increase and decrease quantity within limits', () => {
      // Increase
      component.increaseQuantity();
      expect(component.selectedQuantity).toBe(2);

      // Decrease
      component.decreaseQuantity();
      expect(component.selectedQuantity).toBe(1);

      // Boundary checks
      component.decreaseQuantity();
      expect(component.selectedQuantity).toBe(1); // Ne doit pas aller en dessous de 1

      component.selectedQuantity = 15; // Quantité max en stock
      component.increaseQuantity();
      expect(component.selectedQuantity).toBe(15); // Ne doit pas dépasser le stock
    });

    it('should add to cart if user is logged in', () => {
      mockAuthService.isLoggedIn.and.returnValue(true);
      spyOn(component as any, 'showSuccessMessage').and.callThrough();

      component.addToCart();

      expect((component as any).showSuccessMessage).toHaveBeenCalledWith('Added 1 item(s) to cart!');
      expect(window.alert).toHaveBeenCalledWith('Added 1 item(s) to cart!');
    });

    it('should show login prompt if user is a guest', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);

      component.addToCart();

      expect(window.confirm).toHaveBeenCalledWith(jasmine.stringMatching(/Please login/));
    });

    it('should redirect to /auth if guest confirms prompt', () => {
      mockAuthService.isLoggedIn.and.returnValue(false);
      (window.confirm as jasmine.Spy).and.returnValue(true); // Simule le clic sur "OK"

      component.addToCart();

      expect(window.location.href).toBe('/auth');
    });

    it('should call location.back() when goBack() is called', () => {
      component.goBack();
      expect(mockLocation.back).toHaveBeenCalled();
    });
  });

  // ======================================================
  // TESTS DES MÉTHODES UTILITAIRES
  // ======================================================
  describe('Helper Methods', () => {
    it('should format price correctly', () => {
      // Note: Le 'NBSP' (espace insécable) est représenté par \u00A0
      expect(component.formatPrice(75000)).toBe('75\u202F000\u00A0FCFA');
      expect(component.formatPrice('25000.50')).toBe('25\u202F001\u00A0FCFA'); // Arrondi
    });

    it('should return correct stock class', () => {
      expect(component.getStockClass(0)).toBe('out-of-stock');
      expect(component.getStockClass(5)).toBe('low-stock');
      expect(component.getStockClass(11)).toBe('in-stock');
    });
  });

  it('should unsubscribe from route subscription on destroy', () => {
    const routeSub = (component as any).routeSubscription;
    spyOn(routeSub, 'unsubscribe');

    component.ngOnDestroy();

    expect(routeSub.unsubscribe).toHaveBeenCalled();
  });
});
*/
