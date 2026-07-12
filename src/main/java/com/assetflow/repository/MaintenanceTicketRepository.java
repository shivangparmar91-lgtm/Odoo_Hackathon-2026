package com.assetflow.repository;

import com.assetflow.entity.MaintenanceTicket;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface MaintenanceTicketRepository extends JpaRepository<MaintenanceTicket, Long> {
    
    @Query("SELECT m FROM MaintenanceTicket m WHERE " +
           "(:status IS NULL OR m.status = :status) AND " +
           "(:priority IS NULL OR m.priority = :priority)")
    Page<MaintenanceTicket> search(@Param("status") String status, @Param("priority") String priority, Pageable pageable);
    
    long countByStatus(String status);
}
