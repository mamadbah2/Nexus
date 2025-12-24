package sn.dev.user_service.web.dto.responses;

import lombok.Data;
import lombok.EqualsAndHashCode;
import org.springframework.hateoas.RepresentationModel;
import sn.dev.user_service.data.entities.User;

@EqualsAndHashCode(callSuper = true)
@Data
public class UserResponse extends RepresentationModel<UserResponse> {
    private String id;
    private String name;
    private String email;
    private String role;
    private String avatar;

    public UserResponse(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.role = user.getRole().toString();
        this.avatar = user.getAvatar();
    }
}
