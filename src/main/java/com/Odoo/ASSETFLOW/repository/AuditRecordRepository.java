package com.Odoo.ASSETFLOW.repository;

import com.Odoo.ASSETFLOW.model.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AuditRecordRepository extends JpaRepository<AuditRecord,Long> {
}
