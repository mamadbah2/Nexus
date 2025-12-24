package sn.dev.product_service.web.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.util.List;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import sn.dev.product_service.data.entities.Product;

@Data
public class ProductUpdateDTO {

    @NotBlank(message = "Product name cannot be blank")
    private String name;

    @NotBlank(message = "Product description cannot be blank")
    private String description;

    @NotNull(message = "Product price cannot be null")
    @Positive(message = "Product price must be positive")
    private Double price;

    @Min(value = 1, message = "Quantity must be at least 1")
    private Integer quantity;

    private List<MultipartFile> images;

    public Product toProduct(String userId) {
        return new Product(name, description, price, quantity, userId);
    }

    public List<MultipartFile> getImages() {
        return images != null ? images : List.of();
    }
}
