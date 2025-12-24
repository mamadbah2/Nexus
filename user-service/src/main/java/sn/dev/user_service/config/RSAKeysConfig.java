package sn.dev.user_service.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;

@ConfigurationProperties(prefix = "rsa")
public record RSAKeysConfig(RSAPrivateKey privateKey, RSAPublicKey publicKey) {
}
