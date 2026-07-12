package com.Odoo.ASSETFLOW.model;


import com.Odoo.ASSETFLOW.entity.MaintenanceStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "maintenance_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequest {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asset_id")
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "requested_by")
    private User requestedBy;

    @Column(length = 1000)
    private String issueDescription;

    @Enumerated(EnumType.STRING)
    private MaintenanceStatus status;

    private String technician;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
