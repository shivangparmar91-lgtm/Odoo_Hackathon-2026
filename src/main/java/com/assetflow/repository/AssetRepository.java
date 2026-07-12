package com.assetflow.repository;

import com.assetflow.entity.Asset;
import com.assetflow.entity.AssetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetRepository extends JpaRepository<Asset, Long> {
    
    @Query("SELECT a FROM Asset a WHERE " +
           "(:search IS NULL OR LOWER(a.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(a.tag) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:status IS NULL OR a.status = :status) AND " +
           "(:categoryId IS NULL OR a.category.id = :categoryId)")
    Page<Asset> search(@Param("search") String search, @Param("status") AssetStatus status, @Param("categoryId") Long categoryId, Pageable pageable);
    
    long countByStatus(AssetStatus status);
}
