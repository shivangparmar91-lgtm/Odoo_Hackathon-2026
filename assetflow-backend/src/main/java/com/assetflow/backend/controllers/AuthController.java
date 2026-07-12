package com.assetflow.backend.controllers;

import com.assetflow.backend.models.User;
import com.assetflow.backend.payload.JwtResponse;
import com.assetflow.backend.payload.LoginRequest;
import com.assetflow.backend.repositories.UserRepository;
import com.assetflow.backend.security.JwtUtils;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @Autowired
    UserRepository userRepository;

    @Autowired
    PasswordEncoder encoder;

    @Autowired
    JwtUtils jwtUtils;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getEmail());
        
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // Compare password
            if (encoder.matches(loginRequest.getPassword(), user.getPassword())) {
                String jwt = jwtUtils.generateJwtToken(user.getEmail(), user.getRole().name(), user.getId());
                
                return ResponseEntity.ok(new JwtResponse(jwt, 
                        new JwtResponse.UserDto(
                                user.getId(), 
                                user.getFirstName(), 
                                user.getLastName(), 
                                user.getEmail(), 
                                user.getRole().name()
                        )));
            }
        }
        
        return ResponseEntity.status(401).body("Error: Unauthorized. Invalid email or password.");
    }
    @PostMapping("/signup")
    public ResponseEntity<?> registerUser(@Valid @RequestBody com.assetflow.backend.payload.SignupRequest signUpRequest) {
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        User user = new User();
        user.setFirstName(signUpRequest.getFirstName());
        user.setLastName(signUpRequest.getLastName());
        user.setEmail(signUpRequest.getEmail());
        user.setPassword(encoder.encode(signUpRequest.getPassword()));
        user.setRole(User.Role.EMPLOYEE);
        
        userRepository.save(user);

        return ResponseEntity.ok("User registered successfully!");
    }
    
    // Quick test endpoint to seed a user if DB is empty (since it's H2 in-memory)
    @PostMapping("/seed")
    public ResponseEntity<?> seedAdmin() {
        if (!userRepository.existsByEmail("admin@assetflow.com")) {
            User admin = new User();
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setEmail("admin@assetflow.com");
            admin.setPassword(encoder.encode("Admin@123"));
            admin.setRole(User.Role.ADMIN);
            userRepository.save(admin);
            return ResponseEntity.ok("Admin seeded. Email: admin@assetflow.com, Pass: Admin@123");
        }
        return ResponseEntity.badRequest().body("Admin already exists.");
    }
}
