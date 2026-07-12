package com.Odoo.ASSETFLOW.repository;

import com.Odoo.ASSETFLOW.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository extends JpaRepository<Booking,Long> {
}
