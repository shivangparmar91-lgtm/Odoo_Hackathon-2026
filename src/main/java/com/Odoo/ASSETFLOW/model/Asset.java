package com.Odoo.ASSETFLOW.model;


import com.Odoo.ASSETFLOW.entity.AssetStatus;
import com.Odoo.ASSETFLOW.entity.ConditionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "assets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Asset {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String assetName;

    @ManyToOne
    @JoinColumn(name = "category_id")
    private Category category;

    @Column(nullable = false, unique = true)
    private String assetTag;

    @Column(nullable = false, unique = true)
    private String serialNumber;

    private LocalDate acquisitionDate;

    private Double cost;

    @Enumerated(EnumType.STRING)
    private ConditionStatus condition;

    private String location;

    private String photo;

    private String document;

    private Boolean sharedResource;

    @Enumerated(EnumType.STRING)
    private AssetStatus status;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
