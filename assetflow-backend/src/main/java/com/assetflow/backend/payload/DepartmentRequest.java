package com.assetflow.backend.payload;

import jakarta.validation.constraints.NotBlank;

public class DepartmentRequest {
    
    @NotBlank
    private String name;
    
    @NotBlank
    private String code;
    
    private Long headEmployeeId;
    private String locationFloor;
    private String costCenter;
    private String description;
    private String status = "Active";

    public DepartmentRequest() {}

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public Long getHeadEmployeeId() { return headEmployeeId; }
    public void setHeadEmployeeId(Long headEmployeeId) { this.headEmployeeId = headEmployeeId; }

    public String getLocationFloor() { return locationFloor; }
    public void setLocationFloor(String locationFloor) { this.locationFloor = locationFloor; }

    public String getCostCenter() { return costCenter; }
    public void setCostCenter(String costCenter) { this.costCenter = costCenter; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}
