package com.assetflow.repository;

import com.assetflow.entity.ActivityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ActivityLogRepository extends JpaRepository<ActivityLog, Long> {
    
    @Query("SELECT l FROM ActivityLog l WHERE " +
           "(:search IS NULL OR LOWER(l.action) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(l.module) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<ActivityLog> search(@Param("search") String search, Pageable pageable);
    
    Page<ActivityLog> findByUserId(Long userId, Pageable pageable);
}
