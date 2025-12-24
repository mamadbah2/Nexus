package sn.dev.user_service.services;


import org.springframework.security.core.Authentication;

public interface JWTServices {
    String generateToken(Authentication authentication, String userID);
}
