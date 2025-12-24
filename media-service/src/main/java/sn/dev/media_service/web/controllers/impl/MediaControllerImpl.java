package sn.dev.media_service.web.controllers.impl;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import sn.dev.media_service.data.entities.Media;
import sn.dev.media_service.services.MediaService;
import sn.dev.media_service.web.controllers.MediaController;

@RestController
public class MediaControllerImpl implements MediaController {
    private final MediaService mediaService;

    public MediaControllerImpl(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @Override
    public ResponseEntity<Media> uploadNsave(@RequestParam MultipartFile file, @RequestParam String productId) {
        Media media = mediaService.uploadAndSave(file, productId);
        return ResponseEntity.ok(media);
    }

    @Override
    public ResponseEntity<Map<String,String>> uploadImage(MultipartFile file) {
        Map<String,String> url = new HashMap<>();
        url.put("imageUrl", mediaService.uploadImage(file));
        return ResponseEntity.ok(url);
    }

    @Override
    public ResponseEntity<List<Media>> getByProductId(String productId) {
        List<Media> mediaList = mediaService.findByProductId(productId);
        return ResponseEntity.ok(mediaList);
    }

    @Override
    public ResponseEntity<Void> deleteById(String id) {
        mediaService.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    @Override
    public ResponseEntity<Void> deleteByProductId(String productId) {
        mediaService.deleteByProductId(productId);
        return ResponseEntity.noContent().build();
    }
}
