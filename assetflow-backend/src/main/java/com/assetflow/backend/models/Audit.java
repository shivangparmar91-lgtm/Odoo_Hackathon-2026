package com.assetflow.backend.models;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "audits")
public class Audit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private LocalDate date;
    private String status = "SCHEDULED"; // SCHEDULED, IN_PROGRESS, COMPLETED
    private String notes;
    
    @OneToMany(mappedBy = "auditId", cascade = CascadeType.ALL)
    private List<AuditItem> items;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
    public List<AuditItem> getItems() { return items; }
    public void setItems(List<AuditItem> items) { this.items = items; }
}
