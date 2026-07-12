package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Audit;
import com.assetflow.backend.models.AuditItem;
import com.assetflow.backend.repositories.AuditItemRepository;
import com.assetflow.backend.repositories.AuditRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/audits")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuditController {

    private final AuditRepository auditRepo;
    private final AuditItemRepository itemRepo;

    public AuditController(AuditRepository auditRepo, AuditItemRepository itemRepo) {
        this.auditRepo = auditRepo;
        this.itemRepo  = itemRepo;
    }

    @GetMapping
    public ResponseEntity<List<Audit>> getAll() { return ResponseEntity.ok(auditRepo.findAll()); }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return auditRepo.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Audit> create(@RequestBody Audit body) {
        if (body.getStatus() == null) body.setStatus("SCHEDULED");
        return ResponseEntity.ok(auditRepo.save(body));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable Long id, @RequestBody Audit body) {
        return auditRepo.findById(id).map(existing -> {
            if (body.getTitle()  != null) existing.setTitle(body.getTitle());
            if (body.getStatus() != null) existing.setStatus(body.getStatus());
            if (body.getNotes()  != null) existing.setNotes(body.getNotes());
            return ResponseEntity.ok(auditRepo.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<?> start(@PathVariable Long id) {
        return auditRepo.findById(id).map(a -> { a.setStatus("IN_PROGRESS"); return ResponseEntity.ok(auditRepo.save(a)); }).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<?> complete(@PathVariable Long id) {
        return auditRepo.findById(id).map(a -> { a.setStatus("COMPLETED"); return ResponseEntity.ok(auditRepo.save(a)); }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/items")
    public ResponseEntity<List<AuditItem>> getItems(@PathVariable Long id) {
        return ResponseEntity.ok(itemRepo.findAll().stream()
            .filter(i -> id.equals(i.getAuditId())).collect(Collectors.toList()));
    }

    @PutMapping("/{auditId}/items/{itemId}")
    public ResponseEntity<?> updateItem(@PathVariable Long auditId, @PathVariable Long itemId, @RequestBody AuditItem body) {
        return itemRepo.findById(itemId).map(item -> {
            if (body.getStatus() != null) item.setStatus(body.getStatus());
            if (body.getNotes()  != null) item.setNotes(body.getNotes());
            return ResponseEntity.ok(itemRepo.save(item));
        }).orElse(ResponseEntity.notFound().build());
    }
}
