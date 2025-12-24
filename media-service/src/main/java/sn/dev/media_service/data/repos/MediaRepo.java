package sn.dev.media_service.data.repos;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import sn.dev.media_service.data.entities.Media;

@Repository
public interface MediaRepo extends MongoRepository<Media, String> {
    List<Media> findByProductId(String productId);
    void deleteByProductId(String productId);
}
