package com.assetflow.service;

import com.assetflow.entity.Asset;
import com.assetflow.entity.AssetTransfer;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.AssetRepository;
import com.assetflow.repository.AssetTransferRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TransferService {

    private final AssetTransferRepository transferRepo;
    private final AssetRepository assetRepo;
    private final UserRepository userRepo;

    public Page<AssetTransfer> getAll(String status, int page, int size) {
        return transferRepo.findAllFiltered(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    public AssetTransfer getById(Long id) {
        return transferRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Transfer not found"));
    }

    @Transactional
    public AssetTransfer create(Map<String, Object> body) {
        Long assetId = longVal(body.get("assetId"));
        Long toEmployeeId = longVal(body.get("toEmployeeId"));
        if (assetId == null) throw new BadRequestException("Asset is required");
        if (toEmployeeId == null) throw new BadRequestException("Recipient employee is required");

        Asset asset = assetRepo.findById(assetId).orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
        User toUser = userRepo.findById(toEmployeeId).orElseThrow(() -> new ResourceNotFoundException("Recipient employee not found"));

        AssetTransfer transfer = AssetTransfer.builder()
                .asset(asset)
                .toUser(toUser)
                .reason(str(body.get("reason")))
                .status("PENDING")
                .build();
        return transferRepo.save(transfer);
    }

    @Transactional
    public AssetTransfer approve(Long id) {
        AssetTransfer transfer = getById(id);
        transfer.setStatus("APPROVED");
        transfer.setApprovedBy(currentUser());
        transfer.setApprovedAt(LocalDateTime.now());

        Asset asset = transfer.getAsset();
        asset.setDepartment(transfer.getToUser() != null ? transfer.getToUser().getDepartment() : asset.getDepartment());
        assetRepo.save(asset);

        return transferRepo.save(transfer);
    }

    @Transactional
    public AssetTransfer reject(Long id, Map<String, Object> body) {
        AssetTransfer transfer = getById(id);
        transfer.setStatus("REJECTED");
        if (body != null && body.containsKey("reason")) transfer.setReason(str(body.get("reason")));
        return transferRepo.save(transfer);
    }

    private User currentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepo.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Long longVal(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return Long.valueOf(String.valueOf(o).trim()); } catch (NumberFormatException e) { return null; }
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }
}
