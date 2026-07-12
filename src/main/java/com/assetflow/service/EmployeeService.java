package com.assetflow.service;

import com.assetflow.entity.Department;
import com.assetflow.entity.Role;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.DepartmentRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final UserRepository userRepo;
    private final DepartmentRepository deptRepo;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD = "Welcome@123";

    public Page<User> getAll(String search, int page, int size) {
        return userRepo.findAll(PageRequest.of(page, size, Sort.by("firstName")));
    }

    public User getById(Long id) {
        return userRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional
    public User create(Map<String, Object> body) {
        String email = str(body.get("email"));
        if (email == null) throw new BadRequestException("Email is required");
        if (userRepo.existsByEmail(email)) throw new BadRequestException("An employee with this email already exists");
        if (str(body.get("firstName")) == null) throw new BadRequestException("First name is required");
        if (str(body.get("lastName")) == null) throw new BadRequestException("Last name is required");

        User user = User.builder()
                .firstName(str(body.get("firstName")))
                .lastName(str(body.get("lastName")))
                .email(email)
                .password(passwordEncoder.encode(DEFAULT_PASSWORD))
                .role(parseRole(body.get("role")))
                .empId(str(body.get("empId")))
                .status(str(body.get("status")) != null ? str(body.get("status")) : "ACTIVE")
                .phone(str(body.get("phone")))
                .title(str(body.get("title")))
                .doj(date(body.get("doj")))
                .department(resolveDepartment(body.get("dept")))
                .build();
        return userRepo.save(user);
    }

    @Transactional
    public User update(Long id, Map<String, Object> body) {
        User user = getById(id);
        if (body.containsKey("firstName") && str(body.get("firstName")) != null) user.setFirstName(str(body.get("firstName")));
        if (body.containsKey("lastName") && str(body.get("lastName")) != null) user.setLastName(str(body.get("lastName")));
        if (body.containsKey("email") && str(body.get("email")) != null) user.setEmail(str(body.get("email")));
        if (body.containsKey("role") && body.get("role") != null) user.setRole(parseRole(body.get("role")));
        if (body.containsKey("empId")) user.setEmpId(str(body.get("empId")));
        if (body.containsKey("status") && str(body.get("status")) != null) user.setStatus(str(body.get("status")));
        if (body.containsKey("phone")) user.setPhone(str(body.get("phone")));
        if (body.containsKey("title")) user.setTitle(str(body.get("title")));
        if (body.containsKey("doj")) user.setDoj(date(body.get("doj")));
        if (body.containsKey("dept")) user.setDepartment(resolveDepartment(body.get("dept")));
        return userRepo.save(user);
    }

    @Transactional
    public void delete(Long id) {
        userRepo.delete(getById(id));
    }

    private Role parseRole(Object role) {
        if (role == null) return Role.EMPLOYEE;
        try {
            return Role.valueOf(String.valueOf(role).trim());
        } catch (IllegalArgumentException e) {
            return Role.EMPLOYEE;
        }
    }

    private Department resolveDepartment(Object dept) {
        String name = str(dept);
        if (name == null) return null;
        return deptRepo.search(name, null, PageRequest.of(0, 1)).getContent().stream()
                .findFirst()
                .orElseGet(() -> deptRepo.save(Department.builder()
                        .name(name)
                        .code("DEP-" + System.currentTimeMillis())
                        .status("ACTIVE")
                        .build()));
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }

    private java.time.LocalDate date(Object o) {
        if (o == null || String.valueOf(o).isBlank()) return null;
        try { return java.time.LocalDate.parse(String.valueOf(o).trim()); } catch (Exception e) { return null; }
    }
}
