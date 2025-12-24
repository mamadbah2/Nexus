package sn.dev.media_service.services;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import sn.dev.media_service.data.entities.Media;
import sn.dev.media_service.data.repos.MediaRepo;
import sn.dev.media_service.services.CloudStorageService;
import sn.dev.media_service.services.impl.MediaServiceImpl;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

public class MediaServiceImplTests {

    private MediaRepo mediaRepo;
    private CloudStorageService cloudStorageService;
    private MediaServiceImpl mediaService;

    @BeforeEach
    void setUp() {
        mediaRepo = Mockito.mock(MediaRepo.class);
        cloudStorageService = Mockito.mock(CloudStorageService.class);
        mediaService = new MediaServiceImpl(mediaRepo, cloudStorageService);
    }



    @Test
    void uploadImage_validFile_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "img.png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );

        when(cloudStorageService.upload(file)).thenReturn("http://cloud/img.png");

        String url = mediaService.uploadImage(file);

        assertEquals("http://cloud/img.png", url);
    }

    @Test
    void uploadAndSave_invalidFile_empty_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", new byte[]{}
        );

        assertThrows(IllegalArgumentException.class, () -> mediaService.uploadAndSave(file, "product123"));
        verifyNoInteractions(cloudStorageService);
        verifyNoInteractions(mediaRepo);
    }

    @Test
    void uploadAndSave_invalidFileName_throwsException() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "../hack.png", "image/png", new byte[]{(byte) 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A}
        );

        assertThrows(IllegalArgumentException.class, () -> mediaService.uploadAndSave(file, "product123"));
    }

    @Test
    void uploadAndSave_invalidFileSize_throwsException() {
        byte[] largeBytes = new byte[6 * 1024 * 1024]; // 6MB
        MockMultipartFile file = new MockMultipartFile("file", "big.jpg", "image/jpeg", largeBytes);

        assertThrows(IllegalArgumentException.class, () -> mediaService.uploadAndSave(file, "product123"));
    }

    @Test
    void findById_existingMedia_success() {
        Media media = new Media();
        media.setId("123");
        when(mediaRepo.findById("123")).thenReturn(Optional.of(media));

        Media result = mediaService.findById("123");

        assertEquals("123", result.getId());
    }

    @Test
    void findById_notFound_throwsException() {
        when(mediaRepo.findById("notfound")).thenReturn(Optional.empty());

        assertThrows(ResponseStatusException.class, () -> mediaService.findById("notfound"));
    }

    @Test
    void findByProductId_success() {
        Media media1 = new Media();
        media1.setProductId("p1");
        Media media2 = new Media();
        media2.setProductId("p1");
        when(mediaRepo.findByProductId("p1")).thenReturn(Arrays.asList(media1, media2));

        List<Media> result = mediaService.findByProductId("p1");

        assertEquals(2, result.size());
    }

    @Test
    void deleteById_success() {
        mediaService.deleteById("123");
        verify(mediaRepo).deleteById("123");
    }

    @Test
    void deleteByProductId_success() {
        mediaService.deleteByProductId("p1");
        verify(mediaRepo).deleteByProductId("p1");
    }
}
