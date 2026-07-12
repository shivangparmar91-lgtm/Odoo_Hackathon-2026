package com.assetflow.repository;

import com.assetflow.entity.AssetTransfer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetTransferRepository extends JpaRepository<AssetTransfer, Long> {
    
    @Query("SELECT t FROM AssetTransfer t WHERE (:status IS NULL OR t.status = :status)")
    Page<AssetTransfer> findAllFiltered(@Param("status") String status, Pageable pageable);
}
