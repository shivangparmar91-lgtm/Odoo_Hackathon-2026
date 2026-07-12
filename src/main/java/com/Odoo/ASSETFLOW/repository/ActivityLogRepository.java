package com.Odoo.ASSETFLOW.repository;

import com.Odoo.ASSETFLOW.model.ActivityLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ActivityLogRepository extends JpaRepository<ActivityLog,Long> {
}
