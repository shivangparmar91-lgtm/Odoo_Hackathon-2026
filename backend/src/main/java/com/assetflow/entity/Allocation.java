package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "allocations")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Allocation {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "asset_id", nullable = false)
    private Asset asset;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AllocationStatus status;

    private String notes;
    private LocalDateTime returnDate;

    @Column(updatable = false)
    private LocalDateTime allocatedAt;

    @PrePersist protected void onCreate() {
        allocatedAt = LocalDateTime.now();
    }
}
