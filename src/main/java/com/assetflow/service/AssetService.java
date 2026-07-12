package com.assetflow.service;

import com.assetflow.entity.Asset;
import com.assetflow.entity.AssetCategory;
import com.assetflow.entity.AssetCondition;
import com.assetflow.entity.AssetStatus;
import com.assetflow.entity.Department;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.AssetCategoryRepository;
import com.assetflow.repository.AssetRepository;
import com.assetflow.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AssetService {

    private final AssetRepository assetRepo;
    private final AssetCategoryRepository categoryRepo;
    private final DepartmentRepository deptRepo;

    public Page<Asset> getAll(String search, String statusStr, Long categoryId, int page, int size) {
        AssetStatus status = statusStr != null ? AssetStatus.valueOf(statusStr.toUpperCase()) : null;
        return assetRepo.search(search, status, categoryId, PageRequest.of(page, size, Sort.by("name")));
    }

    public Asset getById(Long id) {
        return assetRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
    }

    @Transactional
    public Asset create(Map<String, String> body) {
        String name = str(body.get("name"));
        String tag = str(body.get("assetTag"));
        if (name == null) throw new BadRequestException("Asset name is required");
        if (tag == null) throw new BadRequestException("Asset tag is required");

        Asset asset = Asset.builder()
                .name(name)
                .tag(tag)
                .serialNumber(str(body.get("serialNo")))
                .model(str(body.get("model")))
                .manufacturer(str(body.get("brand")))
                .status(AssetStatus.AVAILABLE)
                .assetCondition(parseCondition(body.get("condition")))
                .purchasePrice(decimal(body.get("purchaseCost")))
                .purchaseDate(date(body.get("purchaseDate")))
                .location(str(body.get("location")))
                .category(resolveCategory(str(body.get("category"))))
                .department(resolveDepartment(str(body.get("department"))))
                .build();
        return assetRepo.save(asset);
    }

    @Transactional
    public Asset update(Long id, Map<String, String> body) {
        Asset asset = getById(id);
        if (str(body.get("name")) != null) asset.setName(str(body.get("name")));
        if (str(body.get("assetTag")) != null) asset.setTag(str(body.get("assetTag")));
        if (body.containsKey("serialNo")) asset.setSerialNumber(str(body.get("serialNo")));
        if (body.containsKey("model")) asset.setModel(str(body.get("model")));
        if (body.containsKey("brand")) asset.setManufacturer(str(body.get("brand")));
        if (body.containsKey("condition") && str(body.get("condition")) != null) asset.setAssetCondition(parseCondition(body.get("condition")));
        if (body.containsKey("purchaseCost")) asset.setPurchasePrice(decimal(body.get("purchaseCost")));
        if (body.containsKey("purchaseDate")) asset.setPurchaseDate(date(body.get("purchaseDate")));
        if (body.containsKey("location")) asset.setLocation(str(body.get("location")));
        if (body.containsKey("status") && str(body.get("status")) != null) asset.setStatus(AssetStatus.valueOf(body.get("status").toUpperCase()));
        if (body.containsKey("category") && str(body.get("category")) != null) asset.setCategory(resolveCategory(str(body.get("category"))));
        if (body.containsKey("department")) asset.setDepartment(resolveDepartment(str(body.get("department"))));
        return assetRepo.save(asset);
    }

    @Transactional
    public void delete(Long id) {
        assetRepo.delete(getById(id));
    }

    private AssetCategory resolveCategory(String nameOrId) {
        if (nameOrId == null) throw new BadRequestException("Asset category is required");
        try {
            Long id = Long.valueOf(nameOrId);
            return categoryRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
        } catch (NumberFormatException e) {
            return categoryRepo.search(nameOrId, null, null, PageRequest.of(0, 1)).getContent().stream()
                    .findFirst()
                    .orElseGet(() -> categoryRepo.save(AssetCategory.builder()
                            .name(nameOrId).type("OTHER").status("ACTIVE").build()));
        }
    }

    private Department resolveDepartment(String nameOrId) {
        if (nameOrId == null || nameOrId.isBlank()) return null;
        try {
            Long id = Long.valueOf(nameOrId);
            return deptRepo.findById(id).orElse(null);
        } catch (NumberFormatException e) {
            return deptRepo.search(nameOrId, null, PageRequest.of(0, 1)).getContent().stream()
                    .findFirst()
                    .orElseGet(() -> deptRepo.save(Department.builder()
                            .name(nameOrId).code("DEP-" + System.currentTimeMillis()).status("ACTIVE").build()));
        }
    }

    private AssetCondition parseCondition(String cond) {
        if (cond == null || cond.isBlank()) return AssetCondition.GOOD;
        try {
            return AssetCondition.valueOf(cond.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return AssetCondition.GOOD;
        }
    }

    private BigDecimal decimal(String s) {
        if (s == null || s.isBlank()) return null;
        try { return new BigDecimal(s.trim()); } catch (NumberFormatException e) { return null; }
    }

    private LocalDate date(String s) {
        if (s == null || s.isBlank()) return null;
        try { return LocalDate.parse(s.trim()); } catch (Exception e) { return null; }
    }

    private String str(String s) {
        if (s == null) return null;
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }
}
