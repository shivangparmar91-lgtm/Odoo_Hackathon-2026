package com.assetflow.repository;

import com.assetflow.entity.ResourceBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ResourceBookingRepository extends JpaRepository<ResourceBooking, Long> {
    
    @Query("SELECT b FROM ResourceBooking b WHERE b.resourceName = :resource AND b.status = 'CONFIRMED' AND " +
           "(b.startTime < :end AND b.endTime > :start)")
    List<ResourceBooking> findConflicts(@Param("resource") String resource, @Param("start") LocalDateTime start, @Param("end") LocalDateTime end);
    
    @Query("SELECT b FROM ResourceBooking b WHERE b.endTime > CURRENT_TIMESTAMP ORDER BY b.startTime ASC")
    List<ResourceBooking> findUpcoming();
}
