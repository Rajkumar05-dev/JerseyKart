package com.jerseykart.backend.controller;

import com.jerseykart.backend.config.JwtProvider;
import com.jerseykart.backend.entity.Cart;
import com.jerseykart.backend.entity.Role;
import com.jerseykart.backend.entity.User;
import com.jerseykart.backend.repository.CartRepository;
import com.jerseykart.backend.repository.UserRepository;
import com.jerseykart.backend.service.CustomUserServiceImplementation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtProvider jwtProvider;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private CustomUserServiceImplementation customUserService;

    @Autowired
    private CartRepository cartRepository;

    @PostMapping("/signup")
    public ResponseEntity<String> createUserHandler(@RequestBody User user) {
        
        Optional<User> isEmailExist = userRepository.findByEmail(user.getEmail());
        
        if (isEmailExist.isPresent()) {
            return new ResponseEntity<>("Email is already used with another account", HttpStatus.BAD_REQUEST);
        }
        
        User createdUser = new User();
        createdUser.setEmail(user.getEmail());
        createdUser.setPassword(passwordEncoder.encode(user.getPassword()));
        createdUser.setFirstName(user.getFirstName());
        createdUser.setLastName(user.getLastName());
        createdUser.setRole(Role.USER);

        User savedUser = userRepository.save(createdUser);

        Cart cart = new Cart();
        cart.setUser(savedUser);
        cartRepository.save(cart);

        Authentication authentication = new UsernamePasswordAuthenticationToken(savedUser.getEmail(), savedUser.getPassword());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        return new ResponseEntity<>(token, HttpStatus.CREATED);
    }
    
    @PostMapping("/signin")
    public ResponseEntity<String> loginUserHandler(@RequestBody User user) {
        
        Authentication authentication = authenticate(user.getEmail(), user.getPassword());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        String token = jwtProvider.generateToken(authentication);

        return new ResponseEntity<>(token, HttpStatus.OK);
    }
    
    private Authentication authenticate(String username, String password) {
        UserDetails userDetails = customUserService.loadUserByUsername(username);

        if(userDetails == null) {
            throw new BadCredentialsException("Invalid Username");
        }
        
        if(!passwordEncoder.matches(password, userDetails.getPassword())) {
            throw new BadCredentialsException("Invalid password...");
        }

        return new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
    }
}
