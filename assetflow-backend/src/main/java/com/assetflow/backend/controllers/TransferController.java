package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Transfer;
import com.assetflow.backend.repositories.TransferRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/transfers")
@CrossOrigin(origins = "*", maxAge = 3600)
public class TransferController {

    private final TransferRepository repo;
    public TransferController(TransferRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<Transfer>> getAll() { return ResponseEntity.ok(repo.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Transfer> create(@RequestBody Transfer body) {
        if (body.getStatus() == null) body.setStatus("PENDING");
        return ResponseEntity.ok(repo.save(body));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return repo.findById(id).map(t -> { t.setStatus("COMPLETED"); return ResponseEntity.ok(repo.save(t)); }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> reject(@PathVariable Long id) {
        return repo.findById(id).map(t -> { t.setStatus("REJECTED"); return ResponseEntity.ok(repo.save(t)); }).orElse(ResponseEntity.notFound().build());
    }
}
