package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class ActivityLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String action;

    @Column(nullable = false)
    private String module;

    private String details;

    private String entityType;
    private Long entityId;

    @Column(updatable = false)
    private LocalDateTime timestamp;

    @PrePersist protected void onCreate() {
        timestamp = LocalDateTime.now();
    }
}
