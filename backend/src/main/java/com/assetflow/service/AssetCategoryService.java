package com.assetflow.service;

import com.assetflow.entity.AssetCategory;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.AssetCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AssetCategoryService {

    private final AssetCategoryRepository categoryRepo;

    public Page<AssetCategory> getAll(String search, String type, String status, int page, int size) {
        return categoryRepo.search(search, type, status, PageRequest.of(page, size, Sort.by("name")));
    }

    public AssetCategory getById(Long id) {
        return categoryRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Category not found"));
    }

    @org.springframework.transaction.annotation.Transactional
    public AssetCategory create(java.util.Map<String, Object> body) {
        String name = str(body.get("name"));
        if (name == null) throw new com.assetflow.exception.BadRequestException("Category name is required");
        if (categoryRepo.existsByName(name)) throw new com.assetflow.exception.BadRequestException("A category with this name already exists");

        AssetCategory category = AssetCategory.builder()
                .name(name)
                .type(str(body.get("type")))
                .description(str(body.get("description")))
                .status(str(body.get("status")) != null ? str(body.get("status")) : "ACTIVE")
                .icon(str(body.get("icon")))
                .color(str(body.get("color")))
                .usefulLife(intOrNull(body.get("life")))
                .depreciationRate(decimalOrNull(body.get("depreciation")))
                .build();
        return categoryRepo.save(category);
    }

    @org.springframework.transaction.annotation.Transactional
    public AssetCategory update(Long id, java.util.Map<String, Object> body) {
        AssetCategory category = getById(id);
        if (body.containsKey("name") && str(body.get("name")) != null) category.setName(str(body.get("name")));
        if (body.containsKey("type")) category.setType(str(body.get("type")));
        if (body.containsKey("description")) category.setDescription(str(body.get("description")));
        if (body.containsKey("status") && str(body.get("status")) != null) category.setStatus(str(body.get("status")));
        if (body.containsKey("icon")) category.setIcon(str(body.get("icon")));
        if (body.containsKey("color")) category.setColor(str(body.get("color")));
        if (body.containsKey("life")) category.setUsefulLife(intOrNull(body.get("life")));
        if (body.containsKey("depreciation")) category.setDepreciationRate(decimalOrNull(body.get("depreciation")));
        return categoryRepo.save(category);
    }

    @org.springframework.transaction.annotation.Transactional
    public void delete(Long id) {
        categoryRepo.delete(getById(id));
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }

    private Integer intOrNull(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return (int) Double.parseDouble(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }

    private java.math.BigDecimal decimalOrNull(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return new java.math.BigDecimal(String.valueOf(o)); } catch (NumberFormatException e) { return null; }
    }
}
