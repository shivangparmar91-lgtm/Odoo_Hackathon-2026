package com.assetflow.controller;

import com.assetflow.entity.MaintenanceTicket;
import com.assetflow.service.MaintenanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/maintenance")
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    @GetMapping
    public ResponseEntity<Page<MaintenanceTicket>> getAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String priority,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(maintenanceService.getAll(status, priority, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaintenanceTicket> getById(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getById(id));
    }

    @PostMapping
    public ResponseEntity<MaintenanceTicket> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(maintenanceService.create(body));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicket> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(maintenanceService.update(id, body));
    }

    @PostMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicket> approve(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.approve(id));
    }

    @PostMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicket> reject(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(maintenanceService.reject(id, body));
    }

    @PostMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<MaintenanceTicket> complete(@PathVariable Long id, @RequestBody(required = false) Map<String, Object> body) {
        return ResponseEntity.ok(maintenanceService.complete(id, body));
    }
}
