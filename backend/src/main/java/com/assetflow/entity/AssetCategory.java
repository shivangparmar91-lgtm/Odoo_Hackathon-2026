package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "asset_categories")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class AssetCategory {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    private String type; // HARDWARE, SOFTWARE, FURNITURE, etc.
    private String description;
    
    @Column(nullable = false)
    private String status;
    
    private String icon;
    private String color;
    
    private Integer usefulLife; // in years
    private BigDecimal depreciationRate;
}
