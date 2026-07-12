package com.assetflow.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/employees")
@CrossOrigin(origins = "*", maxAge = 3600)
public class EmployeeController {

    private final com.assetflow.backend.repositories.UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    public EmployeeController(com.assetflow.backend.repositories.UserRepository userRepository, org.springframework.security.crypto.password.PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody EmployeeRequest body) {
        com.assetflow.backend.models.User user = new com.assetflow.backend.models.User();
        user.setFirstName(body.getFirstName());
        user.setLastName(body.getLastName());
        user.setEmail(body.getEmail());
        user.setEmpId(body.getEmpId());
        user.setPhone(body.getPhone());
        user.setTitle(body.getTitle());
        user.setDepartment(body.getDept());
        user.setStatus(body.getStatus() != null ? body.getStatus() : "ACTIVE");
        
        try {
            user.setRole(com.assetflow.backend.models.User.Role.valueOf(body.getRole()));
        } catch (Exception e) {
            user.setRole(com.assetflow.backend.models.User.Role.EMPLOYEE);
        }
        
        // Generate a random password for new UI-created employees, or use a default one
        user.setPassword(passwordEncoder.encode("Default@123"));
        
        com.assetflow.backend.models.User saved = userRepository.save(user);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody EmployeeRequest body) {
        java.util.Optional<com.assetflow.backend.models.User> opt = userRepository.findById(id);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        
        com.assetflow.backend.models.User user = opt.get();
        user.setFirstName(body.getFirstName());
        user.setLastName(body.getLastName());
        user.setEmail(body.getEmail());
        user.setEmpId(body.getEmpId());
        user.setPhone(body.getPhone());
        user.setTitle(body.getTitle());
        user.setDepartment(body.getDept());
        user.setStatus(body.getStatus());
        try {
            user.setRole(com.assetflow.backend.models.User.Role.valueOf(body.getRole()));
        } catch (Exception e) {
            // keep existing role
        }
        
        return ResponseEntity.ok(userRepository.save(user));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!userRepository.existsById(id)) return ResponseEntity.notFound().build();
        userRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
