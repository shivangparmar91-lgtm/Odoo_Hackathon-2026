package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Maintenance;
import com.assetflow.backend.repositories.MaintenanceRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/maintenance")
@CrossOrigin(origins = "*", maxAge = 3600)
public class MaintenanceController {

    private final MaintenanceRepository repo;
    public MaintenanceController(MaintenanceRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<Maintenance>> getAll(@RequestParam(required = false) String status) {
        if (status != null && !status.isBlank()) {
            return ResponseEntity.ok(repo.findAll().stream()
                .filter(m -> status.equalsIgnoreCase(m.getStatus()))
                .collect(java.util.stream.Collectors.toList()));
        }
        return ResponseEntity.ok(repo.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Maintenance> create(@RequestBody Maintenance body) {
        if (body.getStatus() == null) body.setStatus("SCHEDULED");
        return ResponseEntity.ok(repo.save(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Maintenance body) {
        return repo.findById(id).map(existing -> {
            if (body.getStatus() != null) existing.setStatus(body.getStatus());
            if (body.getNotes()  != null) existing.setNotes(body.getNotes());
            if (body.getCost()   != null) existing.setCost(body.getCost());
            if (body.getProvider()!=null) existing.setProvider(body.getProvider());
            return ResponseEntity.ok(repo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return repo.findById(id).map(m -> { m.setStatus("IN_PROGRESS"); return ResponseEntity.ok(repo.save(m)); }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id, @RequestBody(required = false) Maintenance body) {
        return repo.findById(id).map(m -> {
            m.setStatus("COMPLETED");
            if (body != null && body.getNotes() != null) m.setNotes(body.getNotes());
            return ResponseEntity.ok(repo.save(m));
        }).orElse(ResponseEntity.notFound().build());
    }
}
