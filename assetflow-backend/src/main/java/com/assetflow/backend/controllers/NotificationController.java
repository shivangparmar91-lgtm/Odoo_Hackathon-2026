package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Notification;
import com.assetflow.backend.repositories.NotificationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/notifications")
@CrossOrigin(origins = "*", maxAge = 3600)
public class NotificationController {

    private final NotificationRepository repo;
    public NotificationController(NotificationRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll() {
        return ResponseEntity.ok(repo.findAll().stream()
            .sorted(Comparator.comparing(Notification::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList()));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<?> unreadCount() {
        long count = repo.findAll().stream().filter(n -> Boolean.FALSE.equals(n.getRead())).count();
        return ResponseEntity.ok(java.util.Map.of("count", count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markRead(@PathVariable Long id) {
        return repo.findById(id).map(n -> { n.setRead(true); return ResponseEntity.ok(repo.save(n)); }).orElse(ResponseEntity.notFound().build());
    }

    @PatchMapping("/read-all")
    public ResponseEntity<?> markAllRead() {
        repo.findAll().forEach(n -> { n.setRead(true); repo.save(n); });
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!repo.existsById(id)) return ResponseEntity.notFound().build();
        repo.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
