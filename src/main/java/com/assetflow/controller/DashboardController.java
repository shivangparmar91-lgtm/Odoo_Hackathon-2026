package com.assetflow.controller;

import com.assetflow.entity.AssetStatus;
import com.assetflow.repository.AssetRepository;
import com.assetflow.repository.MaintenanceTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final AssetRepository assetRepo;
    private final MaintenanceTicketRepository maintenanceRepo;

    @GetMapping("/metrics")
    public ResponseEntity<Map<String, Object>> getMetrics() {
        long totalAssets = assetRepo.count();
        long activeAssets = assetRepo.countByStatus(AssetStatus.AVAILABLE);
        long inMaintenance = maintenanceRepo.countByStatus("IN_PROGRESS");
        long pendingMaintenance = maintenanceRepo.countByStatus("PENDING");

        return ResponseEntity.ok(Map.of(
                "totalAssets", totalAssets,
                "activeAssets", activeAssets,
                "inMaintenance", inMaintenance,
                "pendingMaintenance", pendingMaintenance
        ));
    }
}
