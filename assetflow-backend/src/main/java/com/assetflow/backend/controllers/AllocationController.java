package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Allocation;
import com.assetflow.backend.repositories.AllocationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/allocations")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AllocationController {

    private final AllocationRepository allocationRepository;

    public AllocationController(AllocationRepository allocationRepository) {
        this.allocationRepository = allocationRepository;
    }

    @GetMapping
    public ResponseEntity<List<Allocation>> getAll() {
        return ResponseEntity.ok(allocationRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return allocationRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Allocation> create(@RequestBody Allocation allocation) {
        return ResponseEntity.ok(allocationRepository.save(allocation));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Allocation body) {
        return allocationRepository.findById(id).map(existing -> {
            existing.setStatus(body.getStatus());
            existing.setNotes(body.getNotes());
            existing.setActualReturnDate(body.getActualReturnDate());
            return ResponseEntity.ok(allocationRepository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }
}
