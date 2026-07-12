package com.assetflow.backend.controllers;

import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public class AssetRequest {
    private String name;
    private String assetTag;
    private String serialNo;
    private String category;
    private String brand;
    private String model;
    private String condition;
    private String location;
    private String description;
    private String purchaseDate;
    private Double purchaseCost;
    private String vendor;
    private String invoiceNo;
    private String warrantyStart;
    private String warrantyEnd;
    private String department;
    private String notes;
    private List<MultipartFile> photos;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getAssetTag() { return assetTag; }
    public void setAssetTag(String assetTag) { this.assetTag = assetTag; }

    public String getSerialNo() { return serialNo; }
    public void setSerialNo(String serialNo) { this.serialNo = serialNo; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getBrand() { return brand; }
    public void setBrand(String brand) { this.brand = brand; }

    public String getModel() { return model; }
    public void setModel(String model) { this.model = model; }

    public String getCondition() { return condition; }
    public void setCondition(String condition) { this.condition = condition; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getPurchaseDate() { return purchaseDate; }
    public void setPurchaseDate(String purchaseDate) { this.purchaseDate = purchaseDate; }

    public Double getPurchaseCost() { return purchaseCost; }
    public void setPurchaseCost(Double purchaseCost) { this.purchaseCost = purchaseCost; }

    public String getVendor() { return vendor; }
    public void setVendor(String vendor) { this.vendor = vendor; }

    public String getInvoiceNo() { return invoiceNo; }
    public void setInvoiceNo(String invoiceNo) { this.invoiceNo = invoiceNo; }

    public String getWarrantyStart() { return warrantyStart; }
    public void setWarrantyStart(String warrantyStart) { this.warrantyStart = warrantyStart; }

    public String getWarrantyEnd() { return warrantyEnd; }
    public void setWarrantyEnd(String warrantyEnd) { this.warrantyEnd = warrantyEnd; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }

    public List<MultipartFile> getPhotos() { return photos; }
    public void setPhotos(List<MultipartFile> photos) { this.photos = photos; }
}
