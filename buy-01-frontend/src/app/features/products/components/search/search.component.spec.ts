import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { SearchComponent } from './search.component';
import { ProductService } from '../../services/product.service';
import { of } from 'rxjs';
import { SearchVoiceComponent } from '../search-voice/search-voice.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['suggestProducts']);
    productServiceSpy.suggestProducts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [SearchComponent, SearchVoiceComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit valueSearch when onSearch is called', () => {
    spyOn(component.valueSearch, 'emit');
    component.searchControl.setValue('test query');
    component.onSearch();
    expect(component.valueSearch.emit).toHaveBeenCalledWith('test query');
    expect(component.showSuggestions).toBeFalse();
  });

  it('should fetch suggestions when searchControl value changes', fakeAsync(() => {
    const suggestions = ['apple', 'apricot'];
    productServiceSpy.suggestProducts.and.returnValue(of(suggestions));

    component.searchControl.setValue('ap');
    tick(300); // Wait for debounceTime

    expect(productServiceSpy.suggestProducts).toHaveBeenCalledWith('ap');
    expect(component.suggestions).toEqual(suggestions);
    expect(component.showSuggestions).toBeTrue();
  }));

  it('should not fetch suggestions if query is too short', fakeAsync(() => {
    component.searchControl.setValue('a');
    tick(300);

    expect(productServiceSpy.suggestProducts).not.toHaveBeenCalled();
    expect(component.suggestions).toEqual([]);
  }));

  it('should select a suggestion and emit value', () => {
    spyOn(component.valueSearch, 'emit');
    const suggestion = 'banana';
    
    component.selectSuggestion(suggestion);

    expect(component.searchControl.value).toBe(suggestion);
    expect(component.showSuggestions).toBeFalse();
    expect(component.valueSearch.emit).toHaveBeenCalledWith(suggestion);
  });

  it('should handle voice search', () => {
    spyOn(component, 'onSearch');
    const term = 'voice command';
    
    component.onVoiceSearch(term);

    expect(component.searchControl.value).toBe(term);
    expect(component.onSearch).toHaveBeenCalled();
  });

  it('should hide suggestions on blur with delay', fakeAsync(() => {
    component.showSuggestions = true;
    component.onBlur();
    expect(component.showSuggestions).toBeTrue(); // Should still be true immediately
    tick(200);
    expect(component.showSuggestions).toBeFalse();
  }));

  it('should show suggestions on focus if there are suggestions', () => {
    component.suggestions = ['item1'];
    component.showSuggestions = false;
    component.onFocus();
    expect(component.showSuggestions).toBeTrue();
  });
});
