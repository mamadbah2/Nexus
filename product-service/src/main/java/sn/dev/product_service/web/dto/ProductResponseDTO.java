package sn.dev.product_service.web.dto;

import java.util.List;

import lombok.Data;
import sn.dev.product_service.data.entities.Media;
import sn.dev.product_service.data.entities.Product;

@Data
public class ProductResponseDTO {
    private String id;
    private String name;
    private String description;
    private Double price;
    private Integer quantity;
    private String userId;
    private List<Media> images;

    public ProductResponseDTO(Product product, List<Media> images) {
        this.id = product.getId();
        this.name = product.getName();
        this.description = product.getDescription();
        this.price = product.getPrice();
        this.quantity = product.getQuantity();
        this.userId = product.getUserId();
        this.images = images;
    }
}
