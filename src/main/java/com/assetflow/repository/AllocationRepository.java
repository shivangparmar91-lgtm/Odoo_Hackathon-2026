package com.assetflow.repository;

import com.assetflow.entity.Allocation;
import com.assetflow.entity.AllocationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AllocationRepository extends JpaRepository<Allocation, Long> {
    
    @Query("SELECT a FROM Allocation a WHERE " +
           "(:status IS NULL OR a.status = :status)")
    Page<Allocation> search(@Param("status") AllocationStatus status, Pageable pageable);
    
    Optional<Allocation> findByAssetIdAndStatus(Long assetId, AllocationStatus status);
}
