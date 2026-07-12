package com.assetflow.backend.repositories;

import com.assetflow.backend.models.AssetReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AssetReturnRepository extends JpaRepository<AssetReturn, Long> {
}

