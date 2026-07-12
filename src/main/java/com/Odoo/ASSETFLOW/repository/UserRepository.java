package com.Odoo.ASSETFLOW.repository;

import com.Odoo.ASSETFLOW.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User,Long> {
}
