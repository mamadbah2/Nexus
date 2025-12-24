package sn.dev.user_service.services.impl;

import lombok.AllArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import sn.dev.user_service.data.entities.User;
import sn.dev.user_service.data.entities.UserPrincipal;
import sn.dev.user_service.data.repositories.UserRepositories;

@Service
@AllArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final UserRepositories userRepositories;

    @Override
    public UserDetails loadUserByUsername(String mail) throws UsernameNotFoundException {
        User user = userRepositories.findByEmail(mail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (user == null) {
            System.out.println("User Not Found");
            throw new UsernameNotFoundException("username not found");
        }

        return new UserPrincipal(user);
    }
}
