package com.Odoo.ASSETFLOW.repository;

import com.Odoo.ASSETFLOW.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AssetRepository extends JpaRepository<Asset,Long> {
}
