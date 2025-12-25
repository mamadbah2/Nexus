import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchVoiceComponent } from './search-voice.component';
import { ProductService } from '../../services/product.service';
import { throwError } from 'rxjs';

describe('SearchVoiceComponent', () => {
  let component: SearchVoiceComponent;
  let fixture: ComponentFixture<SearchVoiceComponent>;
  let productServiceSpy: jasmine.SpyObj<ProductService>;

  // Mock MediaRecorder
  class MockMediaRecorder {
    state = 'inactive';
    ondataavailable: ((event: any) => void) | null = null;
    onstop: (() => void) | null = null;

    start() {
      this.state = 'recording';
    }
    stop() {
      this.state = 'inactive';
      if (this.onstop) {
        this.onstop();
      }
    }
  }

  beforeEach(async () => {
    productServiceSpy = jasmine.createSpyObj('ProductService', ['transcribeAudio']);

    await TestBed.configureTestingModule({
      imports: [SearchVoiceComponent],
      providers: [
        { provide: ProductService, useValue: productServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchVoiceComponent);
    component = fixture.componentInstance;
    
    // Mock global MediaRecorder
    (globalThis as any).MediaRecorder = MockMediaRecorder;
    
    // Mock navigator.mediaDevices.getUserMedia
    spyOn(navigator.mediaDevices, 'getUserMedia').and.returnValue(
      Promise.resolve({
        getTracks: () => [{ stop: () => {} }]
      } as any)
    );

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start recording', async () => {
    await component.startRecording();
    expect(component.isRecording).toBeTrue();
    expect(component.mediaRecorder).toBeTruthy();
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled();
  });

  it('should stop recording and process audio', async () => {
    await component.startRecording();
    
    // Spy on sendAudio since it's called by onstop
    spyOn(component, 'sendAudio');

    component.stopRecording();

    expect(component.isRecording).toBeFalse();
    expect(component.isProcessing).toBeTrue();
    expect(component.sendAudio).toHaveBeenCalled();
  });

  it('should handle transcription error', () => {
    productServiceSpy.transcribeAudio.and.returnValue(throwError(() => new Error('Error')));
    spyOn(globalThis, 'alert'); // Suppress alert

    const blob = new Blob([''], { type: 'audio/wav' });
    component.sendAudio(blob);

    expect(component.isProcessing).toBeFalse();
  });
});
