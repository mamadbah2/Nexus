package sn.dev.media_service.web.controllers;

import java.util.List;
import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
// import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.multipart.MultipartFile;

import sn.dev.media_service.data.entities.Media;

@RequestMapping("/api/media")
public interface MediaController {
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Media> uploadNsave(@RequestParam MultipartFile file,
            @RequestParam String productId);

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    ResponseEntity<Map<String,String >> uploadImage(@RequestParam MultipartFile file);

    @GetMapping("/product/{productId}")
    ResponseEntity<List<Media>> getByProductId(@PathVariable String productId);

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteById(@PathVariable String id);

    @DeleteMapping("/product/{productId}")
    ResponseEntity<Void> deleteByProductId(@PathVariable String productId);
}
