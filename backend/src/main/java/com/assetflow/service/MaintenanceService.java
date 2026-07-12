package com.assetflow.service;

import com.assetflow.entity.Asset;
import com.assetflow.entity.AssetStatus;
import com.assetflow.entity.MaintenanceTicket;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.AssetRepository;
import com.assetflow.repository.MaintenanceTicketRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceTicketRepository maintenanceRepo;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;

    public Page<MaintenanceTicket> getAll(String status, String priority, int page, int size) {
        return maintenanceRepo.search(status, priority, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public MaintenanceTicket getById(Long id) {
        return maintenanceRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Maintenance ticket not found"));
    }

    @Transactional
    public MaintenanceTicket create(Map<String, Object> body) {
        Long assetId = longVal(body.get("assetId"));
        if (assetId == null) throw new BadRequestException("Asset is required");
        Asset asset = assetRepo.findById(assetId).orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        MaintenanceTicket ticket = MaintenanceTicket.builder()
                .asset(asset)
                .reportedBy(currentUser())
                .type(str(body.get("type")) != null ? str(body.get("type")) : "HARDWARE")
                .priority(str(body.get("priority")) != null ? str(body.get("priority")) : "MEDIUM")
                .status("PENDING")
                .description(str(body.get("description")))
                .estimatedCost(decimal(body.get("estimatedCost")))
                .build();
        return maintenanceRepo.save(ticket);
    }

    @Transactional
    public MaintenanceTicket update(Long id, Map<String, Object> body) {
        MaintenanceTicket ticket = getById(id);
        if (body.containsKey("type") && str(body.get("type")) != null) ticket.setType(str(body.get("type")));
        if (body.containsKey("priority") && str(body.get("priority")) != null) ticket.setPriority(str(body.get("priority")));
        if (body.containsKey("status") && str(body.get("status")) != null) ticket.setStatus(str(body.get("status")));
        if (body.containsKey("description")) ticket.setDescription(str(body.get("description")));
        if (body.containsKey("estimatedCost")) ticket.setEstimatedCost(decimal(body.get("estimatedCost")));
        return maintenanceRepo.save(ticket);
    }

    @Transactional
    public MaintenanceTicket approve(Long id) {
        MaintenanceTicket ticket = getById(id);
        ticket.setStatus("APPROVED");
        ticket.setApprovedBy(currentUser());
        ticket.setApprovedAt(LocalDateTime.now());

        Asset asset = ticket.getAsset();
        asset.setStatus(AssetStatus.IN_MAINTENANCE);
        assetRepo.save(asset);

        return maintenanceRepo.save(ticket);
    }

    @Transactional
    public MaintenanceTicket reject(Long id, Map<String, Object> body) {
        MaintenanceTicket ticket = getById(id);
        ticket.setStatus("REJECTED");
        return maintenanceRepo.save(ticket);
    }

    @Transactional
    public MaintenanceTicket complete(Long id, Map<String, Object> body) {
        MaintenanceTicket ticket = getById(id);
        ticket.setStatus("COMPLETED");
        ticket.setCompletedAt(LocalDateTime.now());
        if (body != null && body.containsKey("actualCost")) ticket.setActualCost(decimal(body.get("actualCost")));

        Asset asset = ticket.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepo.save(asset);

        return maintenanceRepo.save(ticket);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long longVal(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return Long.valueOf(String.valueOf(o).trim()); } catch (NumberFormatException e) { return null; }
    }

    private BigDecimal decimal(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return new BigDecimal(String.valueOf(o).trim()); } catch (NumberFormatException e) { return null; }
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }
}
