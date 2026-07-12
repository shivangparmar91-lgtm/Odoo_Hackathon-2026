package com.assetflow.backend.controllers;

import com.assetflow.backend.models.ActivityLog;
import com.assetflow.backend.repositories.ActivityLogRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/activity-logs")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ActivityLogController {

    private final ActivityLogRepository repo;
    public ActivityLogController(ActivityLogRepository repo) { this.repo = repo; }

    @GetMapping
    public ResponseEntity<List<ActivityLog>> getAll() {
        return ResponseEntity.ok(repo.findAll().stream()
            .sorted(Comparator.comparing(ActivityLog::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<ActivityLog>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(repo.findAll().stream()
            .filter(l -> userId.equals(l.getUserId()))
            .sorted(Comparator.comparing(ActivityLog::getDate, Comparator.nullsLast(Comparator.reverseOrder())))
            .collect(Collectors.toList()));
    }

    @GetMapping("/entity/{type}/{id}")
    public ResponseEntity<List<ActivityLog>> getByEntity(@PathVariable String type, @PathVariable Long id) {
        return ResponseEntity.ok(repo.findAll().stream()
            .filter(l -> type.equalsIgnoreCase(l.getEntityType()) && id.equals(l.getEntityId()))
            .collect(Collectors.toList()));
    }
}
