package com.assetflow.backend.config;

import com.assetflow.backend.models.*;
import com.assetflow.backend.repositories.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final CategoryRepository categoryRepository;
    private final AssetRepository assetRepository;
    private final AllocationRepository allocationRepository;
    private final BookingRepository bookingRepository;
    private final MaintenanceRepository maintenanceRepository;
    private final AuditRepository auditRepository;
    private final AuditItemRepository auditItemRepository;
    private final TransferRepository transferRepository;
    private final AssetReturnRepository assetReturnRepository;
    private final NotificationRepository notificationRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder encoder;

    public DataSeeder(UserRepository userRepository, DepartmentRepository departmentRepository,
                      CategoryRepository categoryRepository, AssetRepository assetRepository,
                      AllocationRepository allocationRepository, BookingRepository bookingRepository,
                      MaintenanceRepository maintenanceRepository, AuditRepository auditRepository,
                      AuditItemRepository auditItemRepository, TransferRepository transferRepository,
                      AssetReturnRepository assetReturnRepository, NotificationRepository notificationRepository,
                      ActivityLogRepository activityLogRepository, PasswordEncoder encoder) {
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.categoryRepository = categoryRepository;
        this.assetRepository = assetRepository;
        this.allocationRepository = allocationRepository;
        this.bookingRepository = bookingRepository;
        this.maintenanceRepository = maintenanceRepository;
        this.auditRepository = auditRepository;
        this.auditItemRepository = auditItemRepository;
        this.transferRepository = transferRepository;
        this.assetReturnRepository = assetReturnRepository;
        this.notificationRepository = notificationRepository;
        this.activityLogRepository = activityLogRepository;
        this.encoder = encoder;
    }

    @Override
    public void run(String... args) throws Exception {

        // ── Departments ──────────────────────────────────────────────────────
        if (departmentRepository.count() == 0) {
            departmentRepository.save(dept("Engineering", "ENG"));
            departmentRepository.save(dept("Human Resources", "HR"));
            departmentRepository.save(dept("Marketing", "MKT"));
            departmentRepository.save(dept("Finance", "FIN"));
            departmentRepository.save(dept("Operations", "OPS"));
        }

        // ── Categories ───────────────────────────────────────────────────────
        if (categoryRepository.count() == 0) {
            categoryRepository.save(cat("Laptops", "Hardware"));
            categoryRepository.save(cat("Monitors", "Hardware"));
            categoryRepository.save(cat("Vehicles", "Hardware"));
            categoryRepository.save(cat("Printers", "Hardware"));
            categoryRepository.save(cat("Software Licenses", "Software"));
            categoryRepository.save(cat("Furniture", "Furniture"));
        }

        // ── Users ────────────────────────────────────────────────────────────
        saveUserIfAbsent("admin@assetflow.com",   "Admin",  "User",   "Admin@123",  User.Role.ADMIN,          "ADM-001", "Administration",  "System Administrator",  "+91-9000000000");
        saveUserIfAbsent("rahul@assetflow.com",   "Rahul",  "Sharma", "Rahul@123",  User.Role.EMPLOYEE,       "EMP-001", "Engineering",     "Software Engineer",      "+91-9111111111");
        saveUserIfAbsent("priya@assetflow.com",   "Priya",  "Patel",  "Priya@123",  User.Role.EMPLOYEE,       "EMP-002", "Human Resources", "HR Manager",             "+91-9222222222");
        saveUserIfAbsent("amit@assetflow.com",    "Amit",   "Singh",  "Amit@123",   User.Role.ASSET_MANAGER,  "EMP-003", "Operations",      "Asset Manager",          "+91-9333333333");
        saveUserIfAbsent("sneha@assetflow.com",   "Sneha",  "Verma",  "Sneha@123",  User.Role.EMPLOYEE,       "EMP-004", "Marketing",       "Marketing Executive",    "+91-9444444444");
        saveUserIfAbsent("vikram@assetflow.com",  "Vikram", "Nair",   "Vikram@123", User.Role.EMPLOYEE,       "EMP-005", "Finance",         "Finance Analyst",        "+91-9555555555");

        // Resolve users by email for reliable FK linkage
        User uRahul  = userRepository.findByEmail("rahul@assetflow.com").orElse(null);
        User uPriya  = userRepository.findByEmail("priya@assetflow.com").orElse(null);
        User uAmit   = userRepository.findByEmail("amit@assetflow.com").orElse(null);
        User uSneha  = userRepository.findByEmail("sneha@assetflow.com").orElse(null);
        User uVikram = userRepository.findByEmail("vikram@assetflow.com").orElse(null);

        // ── Assets ──────────────────────────────────────────────────────────
        if (assetRepository.count() == 0) {
            assetRepository.save(asset("MacBook Pro M3",       "AST-001", "Laptops",          "Apple",     "MacBook Pro 14\" M3",    "APPLE-MBP-2024-001", "ALLOCATED",   "Excellent",    "Engineering Floor",  "Engineering",     180000.0, LocalDate.of(2024,1,15), "Apple Authorized Reseller", LocalDate.of(2024,1,15), LocalDate.of(2026,1,15), "Allocated to Rahul Sharma — Senior Developer."));
            assetRepository.save(asset("Dell XPS 15",          "AST-002", "Laptops",          "Dell",      "XPS 15 9530",           "DELL-XPS-2023-002",  "ALLOCATED",   "Good",         "HR Department",      "Human Resources", 120000.0, LocalDate.of(2023,6,10), "Dell India Pvt Ltd",        LocalDate.of(2023,6,10), LocalDate.of(2026,6,10), "Allocated to Priya Patel — HR Manager."));
            assetRepository.save(asset("Toyota Innova Crysta", "AST-003", "Vehicles",         "Toyota",    "Innova Crysta 2.4 G",   "MH-04-KK-9923",      "ALLOCATED",   "Good",         "Parking - B1",       "Operations",     2200000.0, LocalDate.of(2022,3,20), "Toyota Bharat",             LocalDate.of(2022,3,20), LocalDate.of(2027,3,20), "Allocated to Amit Singh — Operations team."));
            assetRepository.save(asset("LG 4K IPS Monitor",   "AST-004", "Monitors",         "LG",        "27UK850-W",             "LG-MON-2023-004",    "MAINTENANCE", "Needs Repair", "IT Storage",         "Engineering",      35000.0, LocalDate.of(2023,9,5),  "LG Electronics India",      LocalDate.of(2023,9,5),  LocalDate.of(2026,9,5),  "Backlight issue, sent for repair."));
            assetRepository.save(asset("HP LaserJet Pro MFP", "AST-005", "Printers",         "HP",        "MFP M428fdw",           "HP-LJ-2023-005",     "ALLOCATED",   "Good",         "Marketing Office",   "Marketing",        28000.0, LocalDate.of(2023,11,1), "HP India",                  LocalDate.of(2023,11,1), LocalDate.of(2025,11,1), "Allocated to Sneha Verma — Marketing dept."));
            assetRepository.save(asset("MS Office 365",       "AST-006", "Software Licenses","Microsoft", "Office 365 Business",   "MS-O365-2024-006",   "ALLOCATED",   "Excellent",    "Cloud",              "Finance",           7000.0, LocalDate.of(2024,4,1),  "Microsoft India",           LocalDate.of(2024,4,1),  LocalDate.of(2025,4,1),  "Allocated to Vikram Nair — Finance dept."));
        }

        // Resolve assets by tag for FK linkage
        Asset aMacBook = assetRepository.findByAssetTag("AST-001").orElse(null);
        Asset aDell    = assetRepository.findByAssetTag("AST-002").orElse(null);
        Asset aCar     = assetRepository.findByAssetTag("AST-003").orElse(null);
        Asset aMonitor = assetRepository.findByAssetTag("AST-004").orElse(null);
        Asset aPrinter = assetRepository.findByAssetTag("AST-005").orElse(null);
        Asset aOffice  = assetRepository.findByAssetTag("AST-006").orElse(null);

        // ── Allocations (one per employee, with department context) ──────────
        if (allocationRepository.count() == 0 && uRahul != null && uPriya != null && uAmit != null && uSneha != null && uVikram != null) {
            if (aMacBook != null) allocationRepository.save(allocation(aMacBook.getId(), uRahul.getId(),  45, 90,  "MacBook Pro M3 issued to Rahul Sharma — Engineering dept."));
            if (aDell    != null) allocationRepository.save(allocation(aDell.getId(),    uPriya.getId(),  60, 120, "Dell XPS 15 issued to Priya Patel — Human Resources dept."));
            if (aCar     != null) allocationRepository.save(allocation(aCar.getId(),     uAmit.getId(),   30, 180, "Toyota Innova issued to Amit Singh — Operations dept."));
            if (aPrinter != null) allocationRepository.save(allocation(aPrinter.getId(), uSneha.getId(),  20, 365, "HP LaserJet issued to Sneha Verma — Marketing dept."));
            if (aOffice  != null) allocationRepository.save(allocation(aOffice.getId(),  uVikram.getId(), 10, 355, "MS Office 365 license issued to Vikram Nair — Finance dept."));
        }

        // ── Bookings ─────────────────────────────────────────────────────────
        if (bookingRepository.count() == 0 && uRahul != null && uSneha != null && uAmit != null && aCar != null && aMacBook != null) {
            Booking b1 = new Booking(); b1.setAssetId(aCar.getId()); b1.setUserId(uRahul.getId());
            b1.setStartDate(LocalDate.now().plusDays(2)); b1.setEndDate(LocalDate.now().plusDays(5));
            b1.setPurpose("Client site visit - Pune"); b1.setStatus("APPROVED"); bookingRepository.save(b1);

            Booking b2 = new Booking(); b2.setAssetId(aCar.getId()); b2.setUserId(uSneha.getId());
            b2.setStartDate(LocalDate.now().plusDays(8)); b2.setEndDate(LocalDate.now().plusDays(9));
            b2.setPurpose("Marketing event - Mumbai"); b2.setStatus("PENDING"); bookingRepository.save(b2);

            Booking b3 = new Booking(); b3.setAssetId(aMacBook.getId()); b3.setUserId(uAmit.getId());
            b3.setStartDate(LocalDate.now().minusDays(5)); b3.setEndDate(LocalDate.now().minusDays(3));
            b3.setPurpose("Remote work - Bangalore"); b3.setStatus("COMPLETED"); bookingRepository.save(b3);
        }

        // ── Maintenance ──────────────────────────────────────────────────────
        if (maintenanceRepository.count() == 0 && aMonitor != null && aCar != null && aPrinter != null) {
            Maintenance m1 = new Maintenance(); m1.setAssetId(aMonitor.getId()); m1.setType("REPAIR");
            m1.setCost(4500.0); m1.setDate(LocalDate.now().minusDays(3));
            m1.setNextDate(LocalDate.now().plusDays(7)); m1.setProvider("TechFix Solutions");
            m1.setStatus("IN_PROGRESS"); m1.setNotes("Backlight panel replacement in progress."); maintenanceRepository.save(m1);

            Maintenance m2 = new Maintenance(); m2.setAssetId(aCar.getId()); m2.setType("SERVICE");
            m2.setCost(8000.0); m2.setDate(LocalDate.now().minusDays(30));
            m2.setNextDate(LocalDate.now().plusDays(150)); m2.setProvider("Toyota Service Centre");
            m2.setStatus("COMPLETED"); m2.setNotes("Regular 20,000 km service done."); maintenanceRepository.save(m2);

            Maintenance m3 = new Maintenance(); m3.setAssetId(aPrinter.getId()); m3.setType("INSPECTION");
            m3.setCost(500.0); m3.setDate(LocalDate.now().plusDays(5));
            m3.setNextDate(LocalDate.now().plusDays(185)); m3.setProvider("HP Service Hub");
            m3.setStatus("SCHEDULED"); m3.setNotes("Scheduled annual printer checkup."); maintenanceRepository.save(m3);
        }

        // ── Audits & Audit Items ─────────────────────────────────────────────
        if (auditRepository.count() == 0 && aMacBook != null && aDell != null && aMonitor != null) {
            Audit audit1 = new Audit(); audit1.setTitle("Q2 2025 Engineering Assets Audit");
            audit1.setDate(LocalDate.now().minusDays(15)); audit1.setStatus("COMPLETED");
            audit1.setNotes("All assets verified and accounted for."); auditRepository.save(audit1);

            Audit audit2 = new Audit(); audit2.setTitle("Annual Physical Asset Verification 2025");
            audit2.setDate(LocalDate.now().plusDays(10)); audit2.setStatus("SCHEDULED");
            audit2.setNotes("Covering all departments."); auditRepository.save(audit2);

            AuditItem ai1 = new AuditItem(); ai1.setAuditId(audit1.getId()); ai1.setAssetId(aMacBook.getId()); ai1.setStatus("FOUND");   ai1.setNotes("Asset in excellent condition."); auditItemRepository.save(ai1);
            AuditItem ai2 = new AuditItem(); ai2.setAuditId(audit1.getId()); ai2.setAssetId(aDell.getId());    ai2.setStatus("FOUND");   ai2.setNotes("Allocated, verified with HR."); auditItemRepository.save(ai2);
            AuditItem ai3 = new AuditItem(); ai3.setAuditId(audit1.getId()); ai3.setAssetId(aMonitor.getId()); ai3.setStatus("DAMAGED"); ai3.setNotes("Backlight damage found, logged for repair."); auditItemRepository.save(ai3);
        }

        // ── Transfers ────────────────────────────────────────────────────────
        if (transferRepository.count() == 0 && uRahul != null && uSneha != null && uVikram != null && uPriya != null && aMacBook != null && aOffice != null) {
            Transfer t1 = new Transfer(); t1.setAssetId(aMacBook.getId()); t1.setFromUserId(uRahul.getId()); t1.setToUserId(uSneha.getId());
            t1.setDate(LocalDate.now().minusDays(7)); t1.setStatus("COMPLETED");
            t1.setNotes("MacBook temporarily transferred to Sneha for design sprint."); transferRepository.save(t1);

            Transfer t2 = new Transfer(); t2.setAssetId(aOffice.getId()); t2.setFromUserId(uPriya.getId()); t2.setToUserId(uVikram.getId());
            t2.setDate(LocalDate.now()); t2.setStatus("PENDING");
            t2.setNotes("MS Office license transfer to Finance team."); transferRepository.save(t2);
        }

        // ── Asset Returns ────────────────────────────────────────────────────
        if (assetReturnRepository.count() == 0 && uRahul != null && uSneha != null && aMacBook != null && aMonitor != null) {
            AssetReturn r1 = new AssetReturn(); r1.setAssetId(aMacBook.getId()); r1.setUserId(uSneha.getId());
            r1.setConditionStatus("GOOD"); r1.setDate(LocalDate.now().minusDays(2));
            r1.setStatus("COMPLETED"); r1.setNotes("Returned in perfect condition after design sprint."); assetReturnRepository.save(r1);

            AssetReturn r2 = new AssetReturn(); r2.setAssetId(aMonitor.getId()); r2.setUserId(uRahul.getId());
            r2.setConditionStatus("DAMAGED"); r2.setDate(LocalDate.now().minusDays(5));
            r2.setStatus("PENDING"); r2.setNotes("Returned with backlight issue, awaiting repair."); assetReturnRepository.save(r2);
        }

        // ── Notifications ────────────────────────────────────────────────────
        if (notificationRepository.count() == 0 && uRahul != null && uPriya != null && uAmit != null && uSneha != null) {
            Notification n1 = new Notification(); n1.setUserId(uRahul.getId()); n1.setTitle("Asset Allocated");
            n1.setMessage("MacBook Pro M3 (AST-001) has been allocated to you by the Asset Manager."); n1.setType("SUCCESS"); notificationRepository.save(n1);

            Notification n2 = new Notification(); n2.setUserId(uPriya.getId()); n2.setTitle("Asset Allocated");
            n2.setMessage("Dell XPS 15 (AST-002) has been allocated to you. Pickup from HR office."); n2.setType("SUCCESS"); notificationRepository.save(n2);

            Notification n3 = new Notification(); n3.setUserId(uAmit.getId()); n3.setTitle("Maintenance Alert");
            n3.setMessage("LG Monitor (AST-004) is under repair. Expected completion in 7 days."); n3.setType("WARNING"); notificationRepository.save(n3);

            Notification n4 = new Notification(); n4.setUserId(uRahul.getId()); n4.setTitle("Booking Approved");
            n4.setMessage("Your booking for Toyota Innova (AST-003) from " + LocalDate.now().plusDays(2) + " to " + LocalDate.now().plusDays(5) + " is approved."); n4.setType("INFO"); notificationRepository.save(n4);

            Notification n5 = new Notification(); n5.setUserId(uAmit.getId()); n5.setTitle("Warranty Expiring Soon");
            n5.setMessage("Warranty for MacBook Pro M3 (AST-001) expires on 2026-01-15. Please initiate renewal."); n5.setType("WARNING"); notificationRepository.save(n5);
        }

        // ── Activity Logs ────────────────────────────────────────────────────
        if (activityLogRepository.count() == 0 && uAmit != null && uRahul != null && uSneha != null && aMacBook != null && aDell != null && aMonitor != null) {
            ActivityLog log1 = new ActivityLog(); log1.setUserId(uAmit.getId()); log1.setAction("CREATE");
            log1.setEntityType("Asset"); log1.setEntityId(aMacBook.getId());
            log1.setDate(LocalDateTime.now().minusDays(50)); log1.setDetails("Added MacBook Pro M3 to inventory — Engineering dept."); activityLogRepository.save(log1);

            ActivityLog log2 = new ActivityLog(); log2.setUserId(uAmit.getId()); log2.setAction("ALLOCATE");
            log2.setEntityType("Asset"); log2.setEntityId(aDell.getId());
            log2.setDate(LocalDateTime.now().minusDays(60)); log2.setDetails("Allocated Dell XPS 15 to Priya Patel (HR dept)."); activityLogRepository.save(log2);

            ActivityLog log3 = new ActivityLog(); log3.setUserId(uAmit.getId()); log3.setAction("MAINTENANCE");
            log3.setEntityType("Asset"); log3.setEntityId(aMonitor.getId());
            log3.setDate(LocalDateTime.now().minusDays(3)); log3.setDetails("LG Monitor sent for repair to TechFix Solutions."); activityLogRepository.save(log3);

            ActivityLog log4 = new ActivityLog(); log4.setUserId(uRahul.getId()); log4.setAction("RETURN");
            log4.setEntityType("Asset"); log4.setEntityId(aMonitor.getId());
            log4.setDate(LocalDateTime.now().minusDays(5)); log4.setDetails("LG Monitor returned by Rahul Sharma with damage report."); activityLogRepository.save(log4);

            ActivityLog log5 = new ActivityLog(); log5.setUserId(uSneha.getId()); log5.setAction("BOOKING");
            log5.setEntityType("Booking"); log5.setEntityId(2L);
            log5.setDate(LocalDateTime.now().minusDays(1)); log5.setDetails("Sneha Verma booked Toyota Innova for marketing event — Mumbai."); activityLogRepository.save(log5);
        }
    }

    // ── Helper methods ───────────────────────────────────────────────────────

    private Department dept(String name, String code) {
        Department d = new Department(); d.setName(name); d.setCode(code); d.setStatus("ACTIVE"); return d;
    }

    private Category cat(String name, String type) {
        Category c = new Category(); c.setName(name); c.setType(type); return c;
    }

    private void saveUserIfAbsent(String email, String first, String last, String password,
                                   User.Role role, String empId, String dept, String title, String phone) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User u = new User();
            u.setFirstName(first); u.setLastName(last); u.setEmail(email);
            u.setPassword(encoder.encode(password)); u.setRole(role);
            u.setEmpId(empId); u.setDepartment(dept); u.setTitle(title); u.setPhone(phone); u.setStatus("ACTIVE");
            userRepository.save(u);
        }
    }

    private Asset asset(String name, String tag, String category, String brand, String model, String serial,
                        String status, String condition, String location, String department,
                        Double cost, LocalDate purchaseDate, String vendor, LocalDate wStart, LocalDate wEnd, String notes) {
        Asset a = new Asset();
        a.setName(name); a.setAssetTag(tag); a.setCategory(category); a.setBrand(brand); a.setModel(model);
        a.setSerialNo(serial); a.setStatus(status); a.setCondition(condition); a.setLocation(location);
        a.setDepartment(department); a.setPurchaseCost(cost); a.setPurchaseDate(purchaseDate);
        a.setVendor(vendor); a.setWarrantyStart(wStart); a.setWarrantyEnd(wEnd); a.setNotes(notes);
        return a;
    }

    private Allocation allocation(Long assetId, Long employeeId, int daysAgo, int expectedDays, String notes) {
        Allocation al = new Allocation();
        al.setAssetId(assetId); al.setEmployeeId(employeeId);
        al.setAssignedDate(LocalDate.now().minusDays(daysAgo));
        al.setExpectedReturnDate(LocalDate.now().plusDays(expectedDays));
        al.setNotes(notes); al.setStatus("ACTIVE");
        return al;
    }
}
