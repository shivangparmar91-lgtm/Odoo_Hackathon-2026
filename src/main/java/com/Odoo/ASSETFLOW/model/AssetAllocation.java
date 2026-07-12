package com.Odoo.ASSETFLOW.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "asset_allocations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder

public class AssetAllocation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private LocalDate allocationDate;

    private LocalDate expectedReturnDate;

    private LocalDate returnDate;

    @Column(length = 500)
    private String remarks;

    @CreationTimestamp
    private LocalDateTime createdAt;
}
