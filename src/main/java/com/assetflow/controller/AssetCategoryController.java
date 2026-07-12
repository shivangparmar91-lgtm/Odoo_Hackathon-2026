package com.assetflow.controller;

import com.assetflow.entity.AssetCategory;
import com.assetflow.service.AssetCategoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/asset-categories")
@RequiredArgsConstructor
public class AssetCategoryController {

    private final AssetCategoryService categoryService;

    @GetMapping
    public ResponseEntity<Page<AssetCategory>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(categoryService.getAll(search, type, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssetCategory> getById(@PathVariable Long id) {
        return ResponseEntity.ok(categoryService.getById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<AssetCategory> create(@RequestBody Map<String, Object> body) {
        return ResponseEntity.status(HttpStatus.CREATED).body(categoryService.create(body));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<AssetCategory> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(categoryService.update(id, body));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','ASSET_MANAGER')")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
