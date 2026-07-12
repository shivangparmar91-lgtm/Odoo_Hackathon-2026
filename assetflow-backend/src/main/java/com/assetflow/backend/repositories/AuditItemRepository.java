package com.assetflow.backend.repositories;

import com.assetflow.backend.models.AuditItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditItemRepository extends JpaRepository<AuditItem, Long> {
}

