package com.assetflow.backend.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Collections;

@RestController
@RequestMapping("/api/v1/assets")
@CrossOrigin(origins = "*", maxAge = 3600)
public class AssetController {

    private final com.assetflow.backend.repositories.AssetRepository assetRepository;

    public AssetController(com.assetflow.backend.repositories.AssetRepository assetRepository) {
        this.assetRepository = assetRepository;
    }

    @GetMapping
    public ResponseEntity<?> getAll() {
        return ResponseEntity.ok(assetRepository.findAll());
    }

    @PostMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> create(@ModelAttribute AssetRequest body) {
        com.assetflow.backend.models.Asset asset = new com.assetflow.backend.models.Asset();
        asset.setName(body.getName());
        asset.setAssetTag(body.getAssetTag());
        asset.setSerialNo(body.getSerialNo());
        asset.setCategory(body.getCategory());
        asset.setBrand(body.getBrand());
        asset.setModel(body.getModel());
        asset.setCondition(body.getCondition());
        asset.setLocation(body.getLocation());
        asset.setDescription(body.getDescription());
        
        try {
            if (body.getPurchaseDate() != null && !body.getPurchaseDate().isEmpty())
                asset.setPurchaseDate(java.time.LocalDate.parse(body.getPurchaseDate()));
            if (body.getWarrantyStart() != null && !body.getWarrantyStart().isEmpty())
                asset.setWarrantyStart(java.time.LocalDate.parse(body.getWarrantyStart()));
            if (body.getWarrantyEnd() != null && !body.getWarrantyEnd().isEmpty())
                asset.setWarrantyEnd(java.time.LocalDate.parse(body.getWarrantyEnd()));
        } catch (Exception e) {
            // ignore date parsing errors for now
        }
        
        asset.setPurchaseCost(body.getPurchaseCost());
        asset.setVendor(body.getVendor());
        asset.setInvoiceNo(body.getInvoiceNo());
        asset.setDepartment(body.getDepartment());
        asset.setNotes(body.getNotes());
        
        return ResponseEntity.ok(assetRepository.save(asset));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable Long id) {
        if (!assetRepository.existsById(id)) return ResponseEntity.notFound().build();
        assetRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
