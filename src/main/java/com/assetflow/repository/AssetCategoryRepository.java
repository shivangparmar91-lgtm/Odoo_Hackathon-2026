package com.assetflow.repository;

import com.assetflow.entity.AssetCategory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetCategoryRepository extends JpaRepository<AssetCategory, Long> {
    
    @Query("SELECT c FROM AssetCategory c WHERE " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
           "(:type IS NULL OR c.type = :type) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<AssetCategory> search(@Param("search") String search, @Param("type") String type, @Param("status") String status, Pageable pageable);
    
    boolean existsByName(String name);
}
