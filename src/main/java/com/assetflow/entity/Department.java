package com.assetflow.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "departments")
@Data @NoArgsConstructor @AllArgsConstructor @Builder
public class Department {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false, unique = true)
    private String code;

    private String description;
    
    @Column(nullable = false)
    private String status;
    
    private String head;
    private String location;
    private String costCenter;

    @OneToMany(mappedBy = "department")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<User> employees;

    @com.fasterxml.jackson.annotation.JsonProperty("employees")
    public int getEmployeeCount() {
        return employees != null ? employees.size() : 0;
    }
}
