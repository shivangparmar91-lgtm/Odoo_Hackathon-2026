package com.assetflow.backend.models;

import jakarta.persistence.*;

@Entity
@Table(name = "audit_items")
public class AuditItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "audit_id")
    private Long auditId;

    @Column(name = "asset_id")
    private Long assetId;

    private String status = "PENDING"; // FOUND, MISSING, DAMAGED
    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAuditId() { return auditId; }
    public void setAuditId(Long auditId) { this.auditId = auditId; }
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
