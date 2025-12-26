import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchVoiceComponent } from './search-voice.component';
import { ProductService } from '../../services/product.service';
import { of, throwError } from 'rxjs';

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
    // Helper to simulate data available
    simulateDataAvailable(data: Blob) {
        if (this.ondataavailable) {
            this.ondataavailable({ data: data } as any);
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

  it('should accumulate audio chunks', async () => {
    await component.startRecording();
    const mockRecorder = component.mediaRecorder as any;
    const mockBlob = new Blob(['test'], { type: 'audio/wav' });
    
    mockRecorder.simulateDataAvailable(mockBlob);
    
    expect(component.audioChunks.length).toBe(1);
    expect(component.audioChunks[0]).toBe(mockBlob);
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

  it('should send audio and emit transcription on success', () => {
    const mockResponse = { transcription: 'arou yama', translation: 'viens manger', language: 'eng', duration: 2.5 };
    productServiceSpy.transcribeAudio.and.returnValue(of(mockResponse));
    spyOn(component.search, 'emit');

    const blob = new Blob([''], { type: 'audio/wav' });
    component.sendAudio(blob);

    expect(productServiceSpy.transcribeAudio).toHaveBeenCalledWith(blob);
    expect(component.isProcessing).toBeFalse();
    expect(component.search.emit).toHaveBeenCalledWith('arou yama');
  });

  it('should handle transcription error', () => {
    productServiceSpy.transcribeAudio.and.returnValue(throwError(() => new Error('Error')));
    spyOn(globalThis, 'alert'); // Suppress alert

    const blob = new Blob([''], { type: 'audio/wav' });
    component.sendAudio(blob);

    expect(component.isProcessing).toBeFalse();
    // expect(window.alert).toHaveBeenCalled(); // Optional: check if alert was called
  });
});
