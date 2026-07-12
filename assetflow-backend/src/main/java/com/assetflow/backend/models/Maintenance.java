package com.assetflow.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "maintenance")
public class Maintenance {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "asset_id")
    private Long assetId;

    private String type; // REPAIR, SERVICE, INSPECTION
    private Double cost;
    private LocalDate date;
    
    @Column(name = "next_date")
    private LocalDate nextDate;
    
    private String provider;
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED
    private String notes;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getAssetId() { return assetId; }
    public void setAssetId(Long assetId) { this.assetId = assetId; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public Double getCost() { return cost; }
    public void setCost(Double cost) { this.cost = cost; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public LocalDate getNextDate() { return nextDate; }
    public void setNextDate(LocalDate nextDate) { this.nextDate = nextDate; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
