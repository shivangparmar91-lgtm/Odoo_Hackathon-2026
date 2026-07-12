package com.assetflow.config;

import com.assetflow.entity.*;
import com.assetflow.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            UserRepository userRepo,
            DepartmentRepository deptRepo,
            AssetCategoryRepository catRepo,
            AssetRepository assetRepo,
            PasswordEncoder encoder) {

        return args -> {
            // Only seed if no users exist
            if (userRepo.count() > 0) {
                log.info("Database already seeded. Skipping.");
                return;
            }

            log.info("Seeding initial data...");

            // ── Departments ──────────────────────────────────────────
            var sysDept = deptRepo.save(Department.builder()
                    .name("System Administration").code("SYS-001").status("ACTIVE").build());
            
            var itDept = deptRepo.save(Department.builder()
                    .name("Information Technology").code("IT-002").status("ACTIVE").build());
            
            var hrDept = deptRepo.save(Department.builder()
                    .name("Human Resources").code("HR-003").status("ACTIVE").build());
            
            var engDept = deptRepo.save(Department.builder()
                    .name("Engineering").code("ENG-004").status("ACTIVE").build());

            // ── Users (Employees & Admins) ───────────────────────────
            userRepo.save(User.builder()
                    .firstName("System").lastName("Admin")
                    .email("admin@assetflow.com").password(encoder.encode("Admin@123"))
                    .role(Role.ADMIN).empId("SYS-001").status("ACTIVE").department(sysDept).build());

            userRepo.save(User.builder()
                    .firstName("Alice").lastName("Johnson")
                    .email("emp@assetflow.com").password(encoder.encode("Emp@123"))
                    .role(Role.EMPLOYEE).empId("EMP-001").status("ACTIVE").department(sysDept).build());

            userRepo.save(User.builder()
                    .firstName("Bob").lastName("Smith")
                    .email("bsmith@assetflow.com").password(encoder.encode("Bob@123"))
                    .role(Role.EMPLOYEE).empId("EMP-002").status("ACTIVE").department(itDept).build());
            
            userRepo.save(User.builder()
                    .firstName("Carol").lastName("Williams")
                    .email("cwilliams@assetflow.com").password(encoder.encode("Carol@123"))
                    .role(Role.EMPLOYEE).empId("EMP-003").status("ACTIVE").department(hrDept).build());
            
            userRepo.save(User.builder()
                    .firstName("David").lastName("Brown")
                    .email("dbrown@assetflow.com").password(encoder.encode("David@123"))
                    .role(Role.DEPARTMENT_HEAD).empId("EMP-004").status("ACTIVE").department(engDept).build());

            // ── Asset Categories ──────────────────────────────────────
            var catLaptops = catRepo.save(AssetCategory.builder()
                    .name("Laptops").type("HARDWARE").status("ACTIVE").build());
                    
            var catPhones = catRepo.save(AssetCategory.builder()
                    .name("Smartphones").type("HARDWARE").status("ACTIVE").build());
                    
            var catFurn = catRepo.save(AssetCategory.builder()
                    .name("Office Furniture").type("FURNITURE").status("ACTIVE").build());

            // ── Assets ───────────────────────────────────────────────
            assetRepo.save(Asset.builder()
                    .name("MacBook Pro 16\"").tag("AST-001").serialNumber("C02XL123456")
                    .manufacturer("Apple").model("M3 Max").status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.NEW).purchasePrice(new BigDecimal("2499.00"))
                    .purchaseDate(LocalDate.now().minusDays(30)).category(catLaptops).department(itDept).build());

            assetRepo.save(Asset.builder()
                    .name("ThinkPad T14").tag("AST-002").serialNumber("PF123456")
                    .manufacturer("Lenovo").model("Gen 4").status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.GOOD).purchasePrice(new BigDecimal("1299.00"))
                    .purchaseDate(LocalDate.now().minusDays(180)).category(catLaptops).department(engDept).build());

            assetRepo.save(Asset.builder()
                    .name("iPhone 15 Pro").tag("AST-003").serialNumber("FFC123456")
                    .manufacturer("Apple").model("256GB Titanium").status(AssetStatus.ALLOCATED)
                    .assetCondition(AssetCondition.EXCELLENT).purchasePrice(new BigDecimal("1099.00"))
                    .purchaseDate(LocalDate.now().minusDays(90)).category(catPhones).department(sysDept).build());

            assetRepo.save(Asset.builder()
                    .name("Ergonomic Chair").tag("AST-004").serialNumber("HM-AE-112")
                    .manufacturer("Herman Miller").model("Aeron").status(AssetStatus.AVAILABLE)
                    .assetCondition(AssetCondition.GOOD).purchasePrice(new BigDecimal("1400.00"))
                    .purchaseDate(LocalDate.now().minusDays(365)).category(catFurn).department(hrDept).build());

            log.info("✅ Core system data seeded successfully.");
            log.info("   Admin Email:    admin@assetflow.com / Admin@123");
            log.info("   Employee Email: emp@assetflow.com   / Emp@123");
        };
    }
}
