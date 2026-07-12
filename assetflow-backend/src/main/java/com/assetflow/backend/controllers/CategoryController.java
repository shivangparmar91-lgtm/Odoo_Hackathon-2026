package com.assetflow.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/asset-categories")
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryController {

    private final com.assetflow.backend.repositories.CategoryRepository categoryRepository;

    public CategoryController(com.assetflow.backend.repositories.CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(categoryRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody com.assetflow.backend.models.Category category) {
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody com.assetflow.backend.models.Category category) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        category.setId(id);
        return ResponseEntity.ok(categoryRepository.save(category));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!categoryRepository.existsById(id)) return ResponseEntity.notFound().build();
        categoryRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
