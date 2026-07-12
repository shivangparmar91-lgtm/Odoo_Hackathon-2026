package com.assetflow.service;

import com.assetflow.entity.Department;
import com.assetflow.entity.User;
import com.assetflow.exception.BadRequestException;
import com.assetflow.exception.ResourceNotFoundException;
import com.assetflow.repository.DepartmentRepository;
import com.assetflow.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository deptRepo;
    private final UserRepository userRepo;

    public Page<Department> getAll(String search, String status, int page, int size) {
        return deptRepo.search(search, status, PageRequest.of(page, size, Sort.by("name")));
    }

    public Department getById(Long id) {
        return deptRepo.findById(id).orElseThrow(() -> new ResourceNotFoundException("Department not found"));
    }

    @Transactional
    public Department create(Map<String, Object> body) {
        String name = str(body.get("name"));
        String code = str(body.get("code"));
        if (name == null || name.isBlank()) throw new BadRequestException("Department name is required");
        if (code == null || code.isBlank()) throw new BadRequestException("Department code is required");
        if (deptRepo.existsByName(name)) throw new BadRequestException("A department with this name already exists");
        if (deptRepo.existsByCode(code)) throw new BadRequestException("A department with this code already exists");

        Department dept = Department.builder()
                .name(name)
                .code(code)
                .description(str(body.get("description")))
                .status(str(body.get("status")) != null ? str(body.get("status")) : "ACTIVE")
                .location(str(body.get("location")))
                .costCenter(str(body.get("costCenter")))
                .head(resolveHeadName(body.get("headEmployeeId")))
                .build();
        return deptRepo.save(dept);
    }

    @Transactional
    public Department update(Long id, Map<String, Object> body) {
        Department dept = getById(id);
        if (body.containsKey("name") && str(body.get("name")) != null) dept.setName(str(body.get("name")));
        if (body.containsKey("code") && str(body.get("code")) != null) dept.setCode(str(body.get("code")));
        if (body.containsKey("description")) dept.setDescription(str(body.get("description")));
        if (body.containsKey("status") && str(body.get("status")) != null) dept.setStatus(str(body.get("status")));
        if (body.containsKey("location")) dept.setLocation(str(body.get("location")));
        if (body.containsKey("costCenter")) dept.setCostCenter(str(body.get("costCenter")));
        if (body.containsKey("headEmployeeId")) dept.setHead(resolveHeadName(body.get("headEmployeeId")));
        return deptRepo.save(dept);
    }

    @Transactional
    public void delete(Long id) {
        Department dept = getById(id);
        deptRepo.delete(dept);
    }

    private String resolveHeadName(Object headEmployeeId) {
        if (headEmployeeId == null || String.valueOf(headEmployeeId).isBlank()) return null;
        try {
            Long id = Long.valueOf(String.valueOf(headEmployeeId));
            User u = userRepo.findById(id).orElse(null);
            return u != null ? (u.getFirstName() + " " + u.getLastName()).trim() : null;
        } catch (NumberFormatException e) {
            return String.valueOf(headEmployeeId);
        }
    }

    private String str(Object o) {
        if (o == null) return null;
        String s = String.valueOf(o).trim();
        return s.isEmpty() ? null : s;
    }
}
