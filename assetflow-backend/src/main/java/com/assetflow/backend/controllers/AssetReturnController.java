package com.assetflow.backend.controllers;

import com.assetflow.backend.models.AssetReturn;
import com.assetflow.backend.repositories.AssetReturnRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/returns")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetReturnController {

    private final AssetReturnRepository repo;
    public AssetReturnController(AssetReturnRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<AssetReturn>> getAll() { return ResponseEntity.ok(repo.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return repo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<AssetReturn> create(@RequestBody AssetReturn body) {
        if (body.getStatus() == null) body.setStatus("PENDING");
        return ResponseEntity.ok(repo.save(body));
    }

    @PostMapping("/{id}/approve")
    public ResponseEntity<?> approve(@PathVariable Long id) {
        return repo.findById(id).map(r -> { r.setStatus("COMPLETED"); return ResponseEntity.ok(repo.save(r)); }).orElse(ResponseEntity.notFound().build());
    }
}
