package sn.dev.product_service.services;

import java.util.List;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.multipart.MultipartFile;

import sn.dev.product_service.config.FeignSupportConfig;
import sn.dev.product_service.data.entities.Media;

@FeignClient(name = "media-service", url = "${media.service.url}", configuration = FeignSupportConfig.class)
public interface MediaServiceClient {
    @PutMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    Media upload(@RequestPart("file") MultipartFile file, @RequestPart("productId") String productId);

    @GetMapping("/product/{productId}")
    ResponseEntity<List<Media>> getByProductId(@PathVariable String productId);

    @DeleteMapping("/product/{productId}")
    ResponseEntity<Void> deleteByProductId(@PathVariable String productId);
}