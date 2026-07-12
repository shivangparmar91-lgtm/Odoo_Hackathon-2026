package com.assetflow.backend.controllers;

import com.assetflow.backend.models.Department;
import com.assetflow.backend.models.User;
import com.assetflow.backend.payload.DepartmentRequest;
import com.assetflow.backend.repositories.DepartmentRepository;
import com.assetflow.backend.repositories.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/departments")
@CrossOrigin(origins = "*", maxAge = 3600)
public class DepartmentController {

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<Department>> getAllDepartments() {
        return ResponseEntity.ok(departmentRepository.findAll());
    }

    @PostMapping
    public ResponseEntity<?> createDepartment(@Valid @RequestBody DepartmentRequest request) {
        if (departmentRepository.existsByName(request.getName())) {
            return ResponseEntity.badRequest().body("Error: Department name is already taken!");
        }

        if (departmentRepository.existsByCode(request.getCode())) {
            return ResponseEntity.badRequest().body("Error: Department code is already in use!");
        }

        Department department = new Department();
        department.setName(request.getName());
        department.setCode(request.getCode());
        department.setLocationFloor(request.getLocationFloor());
        department.setCostCenter(request.getCostCenter());
        department.setDescription(request.getDescription());
        department.setStatus(request.getStatus());

        if (request.getHeadEmployeeId() != null) {
            User head = userRepository.findById(request.getHeadEmployeeId()).orElse(null);
            department.setHeadEmployee(head);
        }

        departmentRepository.save(department);

        return ResponseEntity.ok(department);
    }

    @GetMapping("/heads")
    public ResponseEntity<List<User>> getDepartmentHeads() {
        // Return all users for now so the dropdown populates, 
        // ideally this should filter by role DEPT_HEAD or ADMIN.
        return ResponseEntity.ok(userRepository.findAll());
    }
}
