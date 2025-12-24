package sn.dev.user_service.services.events;

import lombok.AllArgsConstructor;
import org.springframework.data.rest.core.annotation.HandleBeforeCreate;
import org.springframework.data.rest.core.annotation.HandleBeforeDelete;
import org.springframework.data.rest.core.annotation.HandleBeforeSave;
import org.springframework.data.rest.core.annotation.RepositoryEventHandler;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import sn.dev.user_service.data.entities.User;
import sn.dev.user_service.data.repositories.UserRepositories;
import sn.dev.user_service.exceptions.ForbiddenException;
import sn.dev.user_service.exceptions.InvalidRequestDataException;
import sn.dev.user_service.exceptions.UserAlreadyExistsException;

import java.util.Objects;
import java.util.Optional;
import java.util.regex.Pattern;

@Component
@RepositoryEventHandler
@AllArgsConstructor
public class UserEvents {
    private final PasswordEncoder passwordEncoder;
    private final UserRepositories userRepositories;

    @HandleBeforeCreate
    public void handleUserCreate(User user) throws Exception {
        validationUser(user);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        Optional<User> existingUser = userRepositories.findByEmail(user.getEmail());

        if (existingUser.isPresent()) {
            throw new UserAlreadyExistsException(user.getEmail());
        }

    }

    @HandleBeforeSave
    public void handleUserUpdate(User user) {
        // Ce handler est pour les mises à jour, donc un ID doit exister.
        // On ignore les nouvelles entités, car elles sont gérées par @HandleBeforeCreate.
        if (user.getId() == null) {
            return;
        }

        handleUserDelete(user);

        // On récupère l'état actuel de l'utilisateur dans la base de données
        // pour obtenir l'ancien mot de passe (qui est déjà haché).
        userRepositories.findById(user.getId())
                .map(User::getPassword)
                .ifPresent(currentPasswordHash -> {
                    // On vérifie si le mot de passe de la requête PATCH est différent
                    // du mot de passe haché déjà en base.
                    // S'il est différent, cela signifie qu'un nouveau mot de passe
                    // en clair a été fourni et qu'il faut l'encoder.
                    if (user.getPassword() != null && !user.getPassword().equals(currentPasswordHash)) {
                        user.setPassword(passwordEncoder.encode(user.getPassword()));
                    }
                });
    }

    private void validationUser(User user) throws Exception {
        // 1. Valider que l'objet utilisateur n'est pas nul
        if (user == null) {
            throw new InvalidRequestDataException("L'objet utilisateur ne peut pas être nul.");
        }

        // 2. Valider le champ 'name'
        if (user.getName() == null || user.getName().isBlank()) {
            throw new InvalidRequestDataException("Le nom de l'utilisateur est requis et ne peut pas être vide.");
        }

        // 3. Valider le champ 'email'
        if (user.getEmail() == null || user.getEmail().isBlank()) {
            throw new InvalidRequestDataException("L'email est requis et ne peut pas être vide.");
        }
        // Validation simple du format de l'email avec une expression régulière
        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
        if (!Pattern.matches(emailRegex, user.getEmail())) {
            throw new InvalidRequestDataException("Le format de l'email est invalide.");
        }

        // 4. Valider le champ 'password'
        if (user.getPassword() == null || user.getPassword().isBlank()) {
            throw new InvalidRequestDataException("Le mot de passe est requis et ne peut pas être vide.");
        }
        // Exemple : imposer une longueur minimale pour le mot de passe
        if (user.getPassword().length() < 8) {
            throw new InvalidRequestDataException("Le mot de passe doit contenir au moins 8 caractères.");
        }

        // 5. Valider le champ 'role'
        if (user.getRole() == null) {
            throw new InvalidRequestDataException("Le rôle de l'utilisateur est requis.");
        }
    }

    @HandleBeforeDelete
    public void handleUserDelete(User user) {
        Authentication auth =
                SecurityContextHolder.getContext().getAuthentication();
        Jwt jwt = (Jwt) auth.getPrincipal();
        String userId = jwt.getClaimAsString("userID");

        if (!Objects.equals(userId, user.getId())) {
            throw new ForbiddenException("User n'est pas authoriser");
        }

    }
}
