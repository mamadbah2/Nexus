package sn.dev.media_service.services;

import org.springframework.web.multipart.MultipartFile;

public interface CloudStorageService {

    String upload(MultipartFile file);
}
