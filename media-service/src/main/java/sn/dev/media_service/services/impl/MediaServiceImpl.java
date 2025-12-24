package sn.dev.media_service.services.impl;

import java.io.IOException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import sn.dev.media_service.data.entities.Media;
import sn.dev.media_service.data.repos.MediaRepo;
import sn.dev.media_service.services.CloudStorageService;
import sn.dev.media_service.services.MediaService;

@Service
public class MediaServiceImpl implements MediaService {
    private final MediaRepo mediaRepo;
    private final CloudStorageService cloudStorageService;
    
    // File size limit: 5MB
    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    public MediaServiceImpl(MediaRepo mediaRepo, CloudStorageService cloudStorageService) {
        this.mediaRepo = mediaRepo;
        this.cloudStorageService = cloudStorageService;
    }

    @Override
    public Media uploadAndSave(MultipartFile file, String productId) {
        // 1. Validate file
        validateFile(file);

        // 2. Upload file to cloud (e.g., Cloudinary, S3)
        String imageUrl = cloudStorageService.upload(file);

        // 3. Save media info to MongoDB
        Media media = new Media();
        media.setImageUrl(imageUrl);
        media.setProductId(productId);

        return mediaRepo.save(media);
    }

    @Override
    public String uploadImage(MultipartFile file) {
        // 1. Validate file
        validateFile(file);

        // 2. Upload file to cloud (e.g., Cloudinary, S3)
        return cloudStorageService.upload(file);
    }

    @Override
    public Media findById(String id) {
        return mediaRepo.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Media not found with id: " + id));
    }

    @Override
    public List<Media> findByProductId(String productId) {
        return mediaRepo.findByProductId(productId);
    }

    @Override
    public void deleteById(String id) {
        mediaRepo.deleteById(id);
    }

    @Override
    public void deleteByProductId(String productId) {
        mediaRepo.deleteByProductId(productId);
    }

    /**
     * Comprehensive file validation including size, type, name, and content validation
     */
    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        // Validate file name
        validateFileName(file.getOriginalFilename());

        // Validate file size
        validateFileSize(file);

        // Validate content type
        validateContentType(file);

        // Validate file signature (magic numbers)
        validateFileSignature(file);
    }

    /**
     * Validates file name for security and length constraints
     */
    private void validateFileName(String fileName) {
        if (fileName == null || fileName.trim().isEmpty()) {
            throw new IllegalArgumentException("File name cannot be empty");
        }
        
        if (fileName.length() > 255) {
            throw new IllegalArgumentException("File name too long (max 255 characters)");
        }
        
        // Check for dangerous characters and path traversal attempts
        if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\") || 
            fileName.contains(":") || fileName.contains("*") || fileName.contains("?") || 
            fileName.contains("\"") || fileName.contains("<") || fileName.contains(">") || 
            fileName.contains("|")) {
            throw new IllegalArgumentException("File name contains invalid characters");
        }
    }

    /**
     * Validates file size against configured limit
     */
    private void validateFileSize(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds maximum limit of 5MB");
        }
    }

    /**
     * Validates content type (MIME type)
     */
    private void validateContentType(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !isSupportedImage(contentType)) {
            throw new IllegalArgumentException("Only JPEG, PNG, GIF and WEBP images are allowed.");
        }
    }

    /**
     * Validates file signature (magic numbers) to ensure file type matches content
     */
    private void validateFileSignature(MultipartFile file) {
        try {
            byte[] bytes = file.getBytes();
            if (bytes.length < 4) {
                throw new IllegalArgumentException("File too small to be a valid image");
            }

            String contentType = file.getContentType();
            if (contentType != null) {
                switch (contentType.toLowerCase()) {
                    case "image/jpeg":
                    case "image/jpg":
                        if (!isJPEG(bytes)) {
                            throw new IllegalArgumentException("File content does not match JPEG format");
                        }
                        break;
                    case "image/png":
                        if (!isPNG(bytes)) {
                            throw new IllegalArgumentException("File content does not match PNG format");
                        }
                        break;
                    case "image/gif":
                        if (!isGIF(bytes)) {
                            throw new IllegalArgumentException("File content does not match GIF format");
                        }
                        break;
                    case "image/webp":
                        if (!isWebP(bytes)) {
                            throw new IllegalArgumentException("File content does not match WebP format");
                        }
                        break;
                    default:
                        throw new IllegalArgumentException("Unsupported image format");
                }
            }
        } catch (IOException e) {
            throw new IllegalArgumentException("Error reading file content", e);
        }
    }

    /**
     * Checks if content type is supported
     */
    private boolean isSupportedImage(String contentType) {
        return contentType.equals("image/jpeg") ||
                contentType.equals("image/jpg") ||
                contentType.equals("image/png") ||
                contentType.equals("image/gif") ||
                contentType.equals("image/webp");
    }

    /**
     * Validates JPEG file signature
     */
    private boolean isJPEG(byte[] bytes) {
        return bytes.length >= 2 && 
               (bytes[0] & 0xFF) == 0xFF && 
               (bytes[1] & 0xFF) == 0xD8;
    }

    /**
     * Validates PNG file signature
     */
    private boolean isPNG(byte[] bytes) {
        return bytes.length >= 8 && 
               (bytes[0] & 0xFF) == 0x89 && 
               (bytes[1] & 0xFF) == 0x50 && 
               (bytes[2] & 0xFF) == 0x4E && 
               (bytes[3] & 0xFF) == 0x47 && 
               (bytes[4] & 0xFF) == 0x0D && 
               (bytes[5] & 0xFF) == 0x0A && 
               (bytes[6] & 0xFF) == 0x1A && 
               (bytes[7] & 0xFF) == 0x0A;
    }

    /**
     * Validates GIF file signature
     */
    private boolean isGIF(byte[] bytes) {
        return bytes.length >= 6 && 
               (bytes[0] & 0xFF) == 0x47 && 
               (bytes[1] & 0xFF) == 0x49 && 
               (bytes[2] & 0xFF) == 0x46 && 
               (bytes[3] & 0xFF) == 0x38 && 
               ((bytes[4] & 0xFF) == 0x37 || (bytes[4] & 0xFF) == 0x39) && 
               (bytes[5] & 0xFF) == 0x61;
    }

    /**
     * Validates WebP file signature
     */
    private boolean isWebP(byte[] bytes) {
        return bytes.length >= 12 && 
               (bytes[0] & 0xFF) == 0x52 && 
               (bytes[1] & 0xFF) == 0x49 && 
               (bytes[2] & 0xFF) == 0x46 && 
               (bytes[3] & 0xFF) == 0x46 && 
               (bytes[8] & 0xFF) == 0x57 && 
               (bytes[9] & 0xFF) == 0x45 && 
               (bytes[10] & 0xFF) == 0x42 && 
               (bytes[11] & 0xFF) == 0x50;
    }
}
