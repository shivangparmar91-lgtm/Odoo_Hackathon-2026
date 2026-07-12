package com.assetflow.service;

import com.assetflow.entity.Allocation;
import com.assetflow.entity.AllocationStatus;
import com.assetflow.entity.Asset;
import com.assetflow.entity.AssetStatus;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.AllocationRepository;
import com.assetflow.repository.AssetRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AllocationService {

    private final AllocationRepository allocationRepo;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;

    public Page<Allocation> getAll(String statusStr, int page, int size) {
        AllocationStatus status = statusStr != null ? AllocationStatus.valueOf(statusStr.toUpperCase()) : null;
        return allocationRepo.search(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "allocatedAt")));
    }

    public Allocation getById(Long id) {
        return allocationRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Allocation not found"));
    }

    @Transactional
    public Allocation create(Map<String, Object> body) {
        Long employeeId = longVal(body.get("employeeId"));
        Long assetId = longVal(body.get("assetId"));
        if (employeeId == null) throw new BadRequestException("Employee is required");
        if (assetId == null) throw new BadRequestException("Asset is required");

        User user = userRepo.findById(employeeId).orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        Asset asset = assetRepo.findById(assetId).orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        if (asset.getStatus() != AssetStatus.AVAILABLE) {
            throw new BadRequestException("Asset is not available for allocation");
        }

        Allocation allocation = Allocation.builder()
                .asset(asset)
                .user(user)
                .status(AllocationStatus.ACTIVE)
                .notes(str(body.get("notes")))
                .returnDate(dateTime(body.get("returnDate")))
                .build();
        allocation = allocationRepo.save(allocation);

        asset.setStatus(AssetStatus.ALLOCATED);
        assetRepo.save(asset);

        return allocation;
    }

    @Transactional
    public Allocation returnAsset(Long id, Map<String, Object> body) {
        Allocation allocation = getById(id);
        if (allocation.getStatus() == AllocationStatus.RETURNED) {
            throw new BadRequestException("This allocation has already been returned");
        }
        allocation.setStatus(AllocationStatus.RETURNED);
        allocation.setReturnDate(LocalDateTime.now());
        allocationRepo.save(allocation);

        Asset asset = allocation.getAsset();
        asset.setStatus(AssetStatus.AVAILABLE);
        assetRepo.save(asset);

        return allocation;
    }

    private Long longVal(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return Long.valueOf(String.valueOf(o).trim()); } catch (NumberFormatException e) { return null; }
    }

    private LocalDateTime dateTime(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        String s = String.valueOf(o).trim();
        try {
            return s.length() == 10 ? java.time.LocalDate.parse(s).atStartOfDay() : LocalDateTime.parse(s);
        } catch (Exception e) { return null; }
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }
}
